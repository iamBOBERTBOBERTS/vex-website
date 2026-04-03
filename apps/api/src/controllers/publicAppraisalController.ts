import { Request, Response } from "express";
import type { QuickAppraisalInput } from "@vex/shared";
import { prisma, runWithTenant, findTenantByCustomDomain, normalizeHost } from "../lib/tenant.js";
import { estimateFromQuickInput } from "../lib/appraisalValuation.js";
import { mapAppraisalToOutput } from "../lib/appraisalMapper.js";

async function resolvePublicTenantId(req: Request): Promise<string | null> {
  const q = req.query.tenantId;
  if (typeof q === "string" && q.trim()) return q.trim();
  const forwarded = req.get("x-forwarded-host");
  const host = forwarded ? normalizeHost(forwarded) : req.get("host") ? normalizeHost(req.get("host")!) : "";
  if (host) {
    const t = await findTenantByCustomDomain(host);
    if (t) return t.id;
  }
  const env = process.env.PUBLIC_APPRAISAL_TENANT_ID;
  return env?.trim() || null;
}

/** POST /public/quick-appraisal — unauthenticated instant estimate for marketing / checkout trade-in. */
export async function postQuickAppraisal(req: Request, res: Response) {
  const tenantId = await resolvePublicTenantId(req);
  if (!tenantId) {
    return res.status(400).json({
      code: "BAD_REQUEST",
      message: "Could not resolve tenant (set PUBLIC_APPRAISAL_TENANT_ID or use a mapped custom domain / ?tenantId=)",
    });
  }

  const body = req.body as QuickAppraisalInput;
  const value = estimateFromQuickInput(body);
  const notes = JSON.stringify({
    make: body.make,
    model: body.model,
    year: body.year,
    mileage: body.mileage,
    condition: body.condition ?? null,
    source: "quick_estimate",
  });

  const appraisal = await runWithTenant(tenantId, async () => {
    const row = await prisma.appraisal.create({
      data: {
        tenantId,
        value,
        notes,
        status: "completed",
      },
    });
    await prisma.usageLog.create({
      data: {
        tenantId,
        kind: "QUICK_APPRAISAL",
        quantity: 1,
        amountUsd: 0,
        meta: { source: "quick_estimate", appraisalId: row.id },
      },
    });
    return row;
  });

  return res.status(201).json({
    data: mapAppraisalToOutput(appraisal),
    error: null,
  });
}

/** GET /public/quick-appraisal/:id — read trade-in for checkout (scoped by tenant resolution). */
export async function getQuickAppraisal(req: Request, res: Response) {
  const { id } = req.params;
  const tenantId = await resolvePublicTenantId(req);
  if (!tenantId) {
    return res.status(400).json({
      code: "BAD_REQUEST",
      message: "Could not resolve tenant (set PUBLIC_APPRAISAL_TENANT_ID or ?tenantId=)",
    });
  }

  const appraisal = await runWithTenant(tenantId, () =>
    prisma.appraisal.findFirst({
      where: { id },
      include: {
        vehicle: { select: { id: true, make: true, model: true, trimLevel: true, year: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    })
  );

  if (!appraisal) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Appraisal not found" });
  }

  return res.json({ data: mapAppraisalToOutput(appraisal), error: null });
}
