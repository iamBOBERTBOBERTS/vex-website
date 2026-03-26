import crypto from "node:crypto";
import { ValuationInputSchema, type ValuationInput, type ValuationResult } from "@vex/shared";
import { valuationConfig } from "../config/valuation.js";
import { prisma } from "./tenant.js";
import { valuationCallsTotal } from "./metrics.js";

type ServiceResult =
  | { success: true; result: ValuationResult }
  | { success: false; errorCode: "VALUATION_FAILED" | "DAILY_COST_CAP_EXCEEDED"; fallbackValue: number | null };

function hashInput(input: ValuationInput): string {
  const keyObj = {
    vin: input.vin ?? null,
    make: input.make.toLowerCase(),
    model: input.model.toLowerCase(),
    year: input.year,
    mileage: input.mileage,
    condition: input.condition,
    zipCode: input.zipCode,
  };
  return crypto.createHash("sha256").update(JSON.stringify(keyObj)).digest("hex");
}

function sanitizeVin(vin: string | undefined): string | null {
  if (!vin) return null;
  if (vin.length < 6) return "***";
  return `${vin.slice(0, 3)}********${vin.slice(-3)}`;
}

function vinAuditHash(vin: string | undefined): string {
  if (!vin) return "";
  return crypto.createHash("sha256").update(vin).digest("hex").slice(0, 16);
}

function fallbackFormula(input: ValuationInput): ValuationResult {
  const conditionFactor: Record<ValuationInput["condition"], number> = {
    excellent: 1,
    good: 0.92,
    fair: 0.82,
    poor: 0.65,
  };
  const base = Math.max(3000, 45000 - (new Date().getFullYear() - input.year) * 2200 - input.mileage * 0.04);
  const avg = Math.round(base * conditionFactor[input.condition]);
  return {
    source: "fallback",
    valueLow: Math.round(avg * 0.9),
    valueAvg: avg,
    valueHigh: Math.round(avg * 1.1),
    currency: "USD",
    confidence: 58,
    timestamp: new Date(),
    rawData: { mode: "fallback_formula" },
  };
}

const dailySpend = new Map<string, { date: string; spentUsd: number }>();

function chargeOrReject(tenantId: string, amountUsd: number): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const row = dailySpend.get(tenantId);
  if (!row || row.date !== today) {
    dailySpend.set(tenantId, { date: today, spentUsd: 0 });
  }
  const now = dailySpend.get(tenantId)!;
  if (now.spentUsd + amountUsd > valuationConfig.costCaps.dailyUsdCap) return false;
  now.spentUsd += amountUsd;
  dailySpend.set(tenantId, now);
  return true;
}

async function callEdmunds(input: ValuationInput): Promise<ValuationResult | null> {
  const key = process.env.EDMUNDS_API_KEY;
  const secret = process.env.EDMUNDS_SECRET;
  if (!key || !secret) return null;

  const qs = new URLSearchParams({
    api_key: key,
    make: input.make,
    model: input.model,
    year: String(input.year),
    mileage: String(input.mileage),
    condition: input.condition,
    zip: input.zipCode,
  });
  if (input.vin) qs.set("vin", input.vin);

  const resp = await fetch(`https://api.edmunds.com/v1/tmv?${qs.toString()}`, {
    headers: { "x-edmunds-secret": secret },
  });
  if (resp.status === 429 || resp.status >= 500) return null;
  if (!resp.ok) return null;
  const raw = await resp.json().catch(() => null);
  if (!raw) return null;

  const avg = Number(raw?.tmv ?? raw?.value ?? raw?.average ?? 0);
  if (!Number.isFinite(avg) || avg <= 0) return null;

  return {
    source: "edmunds",
    valueLow: Math.round(avg * 0.93),
    valueAvg: Math.round(avg),
    valueHigh: Math.round(avg * 1.07),
    currency: "USD",
    confidence: 86,
    timestamp: new Date(),
    rawData: raw,
  };
}

async function callMarketCheck(input: ValuationInput): Promise<ValuationResult | null> {
  const key = process.env.MARKETCHECK_API_KEY;
  if (!key) return null;

  const qs = new URLSearchParams({
    api_key: key,
    make: input.make,
    model: input.model,
    year: String(input.year),
    mileage: String(input.mileage),
    zip: input.zipCode,
  });
  if (input.vin) qs.set("vin", input.vin);

  const resp = await fetch(`https://api.marketcheck.com/v2/search/car/active?${qs.toString()}`);
  if (resp.status === 429 || resp.status >= 500) return null;
  if (!resp.ok) return null;
  const raw = await resp.json().catch(() => null);
  if (!raw) return null;

  const prices: number[] = Array.isArray(raw?.listings)
    ? raw.listings.map((x: any) => Number(x?.price)).filter((x: number) => Number.isFinite(x) && x > 0)
    : [];
  if (prices.length === 0) return null;
  prices.sort((a, b) => a - b);
  const low = prices[Math.floor(prices.length * 0.2)] ?? prices[0];
  const high = prices[Math.floor(prices.length * 0.8)] ?? prices[prices.length - 1];
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return {
    source: "marketcheck",
    valueLow: Math.round(low),
    valueAvg: avg,
    valueHigh: Math.round(high),
    currency: "USD",
    confidence: 73,
    timestamp: new Date(),
    rawData: raw,
  };
}

export class ValuationService {
  async getValuation(inputRaw: ValuationInput): Promise<ServiceResult> {
    const parsed = ValuationInputSchema.safeParse(inputRaw);
    if (!parsed.success) {
      return { success: false, errorCode: "VALUATION_FAILED", fallbackValue: null };
    }
    const input = parsed.data;

    const cacheKey = hashInput(input);
    const cached = await prisma.valuationCache.findFirst({
      where: { tenantId: input.tenantId, cacheKey, expiresAt: { gt: new Date() } },
    });
    if (cached) {
      const result = cached.payload as unknown as ValuationResult;
      valuationCallsTotal.inc({ tenant_id: input.tenantId, source: "cache", outcome: "hit" });
      await prisma.eventLog.create({
        data: {
          tenantId: input.tenantId,
          type: "valuation.audit",
          payload: {
            vinHash: vinAuditHash(input.vin),
            source: result.source,
            outcome: "cache_hit",
            cacheKey: cacheKey.slice(0, 16),
          },
        },
      });
      return { success: true, result: { ...result, timestamp: new Date(result.timestamp) } };
    }

    try {
      let result: ValuationResult | null = null;

      if (!chargeOrReject(input.tenantId, valuationConfig.costCaps.minPerCallUsd)) {
        return { success: false, errorCode: "DAILY_COST_CAP_EXCEEDED", fallbackValue: null };
      }

      result = await callEdmunds(input);
      if (!result) {
        if (!chargeOrReject(input.tenantId, valuationConfig.costCaps.maxPerCallUsd)) {
          return { success: false, errorCode: "DAILY_COST_CAP_EXCEEDED", fallbackValue: null };
        }
        result = await callMarketCheck(input);
      }
      if (!result) result = fallbackFormula(input);

      const existingCache = await prisma.valuationCache.findFirst({
        where: { tenantId: input.tenantId, cacheKey },
        select: { id: true },
      });
      if (existingCache) {
        await prisma.valuationCache.updateMany({
          where: { id: existingCache.id, tenantId: input.tenantId, cacheKey },
          data: {
            payload: result as unknown as object,
            expiresAt: new Date(Date.now() + valuationConfig.cacheTtlMs),
          },
        });
      } else {
        await prisma.valuationCache.create({
          data: {
            tenantId: input.tenantId,
            cacheKey,
            payload: result as unknown as object,
            expiresAt: new Date(Date.now() + valuationConfig.cacheTtlMs),
          },
        });
      }

      valuationCallsTotal.inc({ tenant_id: input.tenantId, source: result.source, outcome: "ok" });
      await prisma.eventLog.create({
        data: {
          tenantId: input.tenantId,
          type: "valuation.audit",
          payload: {
            vinHash: vinAuditHash(input.vin),
            source: result.source,
            outcome: "computed",
            valueAvg: result.valueAvg,
          },
        },
      });

      return { success: true, result };
    } catch (err) {
      console.error("valuation failure", {
        tenantId: input.tenantId,
        vin: sanitizeVin(input.vin),
        make: input.make,
        model: input.model,
        year: input.year,
        message: err instanceof Error ? err.message : "unknown",
      });
      const fb = fallbackFormula(input);
      return { success: false, errorCode: "VALUATION_FAILED", fallbackValue: fb.valueAvg };
    }
  }
}
