import { Router } from "express";
import crypto from "node:crypto";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import { prisma } from "../lib/tenant.js";

export const growthRouter: Router = Router();

function hashClaim(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

growthRouter.post("/referrals/claim", requireAuth, requireAnyAuthenticatedRole(), async (req, res) => {
  if (!req.user || !req.tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  const claimCode = String((req.body as { claimCode?: string }).claimCode ?? "");
  if (!claimCode) return res.status(400).json({ code: "BAD_REQUEST", message: "claimCode required" });

  const claimHash = hashClaim(claimCode);
  const existing = await prisma.auditLog.findFirst({
    where: { action: "REFERRAL_CLAIMED", entityId: claimHash },
  });
  if (existing) return res.json({ data: { ok: true, deduped: true }, error: null });

  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId,
      actorId: req.user.userId,
      action: "REFERRAL_CLAIMED",
      entity: "Growth",
      entityId: claimHash,
      payload: { couponUsd: 50, payoutQueued: true },
    },
  });
  await prisma.growthMetric.create({
    data: {
      tenantId: req.tenantId,
      key: "referral_claims",
      value: 1,
      meta: { claimHash },
    },
  });
  return res.json({ data: { ok: true, couponUsd: 50 }, error: null });
});

growthRouter.post("/referrals/generate", requireAuth, requireAnyAuthenticatedRole(), async (req, res) => {
  if (!req.user || !req.tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  const raw = crypto.randomBytes(10).toString("hex");
  const codeHash = hashClaim(raw);
  const existing = await prisma.referral.findFirst({ where: { codeHash } });
  if (!existing) {
    await prisma.referral.create({
      data: {
        tenantId: req.tenantId,
        codeHash,
        createdBy: req.user.userId,
        isActive: true,
      },
    });
  }
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId,
      actorId: req.user.userId,
      action: "REFERRAL_CODE_GENERATED",
      entity: "Referral",
      entityId: codeHash,
      payload: { maxUses: 100 },
    },
  });
  return res.status(201).json({ data: { claimCode: raw }, error: null });
});
