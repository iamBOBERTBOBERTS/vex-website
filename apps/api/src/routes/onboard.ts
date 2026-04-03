import { Router, type Request } from "express";
import jwt from "jsonwebtoken";
import { validateBody } from "../middleware/validate.js";
import {
  onboardingStartSchema,
  onboardingStripeStepSchema,
  onboardingThemeStepSchema,
  onboardingDemoSeedStepSchema,
  onboardingConfirmSchema,
  PilotOnboardSchema,
  type OnboardingStartInput,
} from "@vex/shared";
import { enqueueProvisionTenant } from "../lib/queue.js";
import { systemPrisma, prisma, runWithTenant } from "../lib/tenant.js";

export const onboardRouter: Router = Router();

const ipWindow = new Map<string, { count: number; windowStart: number }>();

function allowIp(ip: string): boolean {
  const now = Date.now();
  const row = ipWindow.get(ip);
  if (!row || now - row.windowStart > 60_000) {
    ipWindow.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (row.count >= 3) return false;
  row.count += 1;
  ipWindow.set(ip, row);
  return true;
}

function signOnboardingToken(payload: { tenantId: string; email: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign({ kind: "onboard", tenantId: payload.tenantId, email: payload.email }, secret, { expiresIn: "30m" });
}

function verifyOnboardingToken(req: Request): { tenantId: string; email: string } | null {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret) as { kind?: string; tenantId?: string; email?: string };
    if (decoded.kind !== "onboard" || !decoded.tenantId || !decoded.email) return null;
    return { tenantId: decoded.tenantId, email: decoded.email };
  } catch {
    return null;
  }
}

onboardRouter.post("/start", validateBody(onboardingStartSchema), async (req, res) => {
  const ip = req.ip ?? "unknown";
  if (!allowIp(ip)) {
    return res.status(429).json({ code: "RATE_LIMITED", message: "Too many onboarding attempts from this IP." });
  }
  const body = req.body as OnboardingStartInput;

  const existing = await systemPrisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return res.status(409).json({ code: "CONFLICT", message: "Email already exists" });
  }

  const created = await systemPrisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: body.dealerName, billingTier: "STARTER", stripeSubscriptionStatus: "TRIAL" },
    });
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: body.email,
        passwordHash: `onboard:${Date.now()}`,
        role: "ADMIN",
        name: body.dealerName,
      },
    });
    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorId: user.id,
        action: "ONBOARD_START",
        entity: "Tenant",
        entityId: tenant.id,
      },
    });
    return { tenantId: tenant.id, userId: user.id };
  });

  const onboardingToken = signOnboardingToken({ tenantId: created.tenantId, email: body.email });
  return res.status(201).json({ data: { ...created, onboardingToken }, error: null });
});

onboardRouter.post("/stripe", validateBody(onboardingStripeStepSchema), async (req, res) => {
  const body = req.body as { tenantId: string; tier: string; interval: "monthly" | "yearly" };
  const session = verifyOnboardingToken(req);
  if (!session || session.tenantId !== body.tenantId) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Invalid onboarding session" });
  }
  await runWithTenant(body.tenantId, () =>
    prisma.tenant.updateMany({
      where: { id: body.tenantId },
      data: { billingTier: body.tier, stripeSubscriptionStatus: "PENDING" },
    })
  );
  return res.json({ data: { ok: true }, error: null });
});

onboardRouter.post("/theme", validateBody(onboardingThemeStepSchema), async (req, res) => {
  const body = req.body as { tenantId: string; customDomain?: string; themeJson?: Record<string, unknown> };
  const session = verifyOnboardingToken(req);
  if (!session || session.tenantId !== body.tenantId) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Invalid onboarding session" });
  }
  await runWithTenant(body.tenantId, () =>
    prisma.tenant.updateMany({
      where: { id: body.tenantId },
      data: {
        customDomain: body.customDomain ?? undefined,
        themeJson: (body.themeJson as object | undefined) ?? undefined,
      },
    })
  );
  return res.json({ data: { ok: true }, error: null });
});

onboardRouter.post("/seed", validateBody(onboardingDemoSeedStepSchema), async (req, res) => {
  const body = req.body as { tenantId: string; enableDemoData: boolean };
  const session = verifyOnboardingToken(req);
  if (!session || session.tenantId !== body.tenantId) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Invalid onboarding session" });
  }
  if (body.enableDemoData) {
    const tenant = await runWithTenant(body.tenantId, () =>
      prisma.tenant.findFirst({ where: { id: body.tenantId }, select: { billingTier: true } })
    );
    const owner = await runWithTenant(body.tenantId, () =>
      prisma.user.findFirst({ where: { tenantId: body.tenantId }, select: { email: true } })
    );
    await enqueueProvisionTenant({
      tenantId: body.tenantId,
      tier: tenant?.billingTier ?? "STARTER",
      email: owner?.email ?? "unknown@tenant.local",
    });
  }
  return res.json({ data: { ok: true }, error: null });
});

onboardRouter.post("/confirm", validateBody(onboardingConfirmSchema), async (req, res) => {
  const tenantId = String((req.body as { tenantId: string }).tenantId);
  const session = verifyOnboardingToken(req);
  if (!session || session.tenantId !== tenantId) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Invalid onboarding session" });
  }
  if (!tenantId) return res.status(400).json({ code: "BAD_REQUEST", message: "tenantId required" });
  await runWithTenant(tenantId, () =>
    prisma.tenant.updateMany({
      where: { id: tenantId },
      data: { onboardedAt: new Date() },
    })
  );
  return res.json({ data: { magicLink: `/login?tenantId=${encodeURIComponent(tenantId)}` }, error: null });
});

onboardRouter.post("/pilot", validateBody(PilotOnboardSchema), async (req, res) => {
  const body = req.body as {
    email: string;
    dealerName: string;
    password: string;
    tier: "STARTER" | "PRO" | "ENTERPRISE";
    interval: "monthly" | "yearly";
    captchaToken: string;
    customDomain?: string;
    enableDemoData: boolean;
  };
  const ip = req.ip ?? "unknown";
  if (!allowIp(ip)) {
    return res.status(429).json({ code: "RATE_LIMITED", message: "Too many onboarding attempts from this IP." });
  }
  const existing = await systemPrisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return res.status(409).json({ code: "CONFLICT", message: "Email already exists" });
  }

  const created = await systemPrisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: body.dealerName,
        billingTier: body.tier,
        stripeSubscriptionStatus: "PENDING",
        customDomain: body.customDomain ?? null,
      },
    });
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: body.email,
        passwordHash: `pilot:${Date.now()}`,
        role: "ADMIN",
        name: body.dealerName,
      },
    });
    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorId: user.id,
        action: "PILOT_ONBOARD_START",
        entity: "Tenant",
        entityId: tenant.id,
        payload: { tier: body.tier, interval: body.interval },
      },
    });
    return { tenantId: tenant.id, userId: user.id };
  });

  if (body.enableDemoData) {
    await enqueueProvisionTenant({
      tenantId: created.tenantId,
      tier: body.tier,
      email: body.email,
    });
  }

  return res.status(201).json({ data: { ...created, billingStatus: "PENDING" }, error: null });
});
