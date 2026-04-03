import { Router } from "express";
import crypto from "node:crypto";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { createReferralSchema } from "@vex/shared";
import { prisma } from "../lib/tenant.js";

export const referralRouter: Router = Router();

function hashCode(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

referralRouter.post("/generate", requireAuth, requireAnyAuthenticatedRole(), validateBody(createReferralSchema), async (req, res) => {
  if (!req.user || !req.tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  const raw = `VEX-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const codeHash = hashCode(raw);
  const maxUses = Number((req.body as { maxUses?: number }).maxUses ?? 100);

  await prisma.referral.create({
    data: {
      tenantId: req.tenantId,
      codeHash,
      createdBy: req.user.userId,
      maxUses,
    },
  });
  return res.status(201).json({ data: { code: raw }, error: null });
});

referralRouter.post("/apply", requireAuth, requireAnyAuthenticatedRole(), async (req, res) => {
  if (!req.user || !req.tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  const code = String((req.body as { code?: string }).code ?? "");
  if (!code) return res.status(400).json({ code: "BAD_REQUEST", message: "code required" });
  const codeHash = hashCode(code);
  const referral = await prisma.referral.findFirst({
    where: { codeHash, isActive: true, tenantId: req.tenantId },
  });
  if (!referral) return res.status(404).json({ code: "NOT_FOUND", message: "Referral code invalid" });
  if (referral.tenantId !== req.tenantId) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Referral code does not belong to this tenant" });
  }
  if (referral.uses >= referral.maxUses) {
    return res.status(409).json({ code: "LIMIT_REACHED", message: "Referral limit reached" });
  }
  await prisma.referral.updateMany({
    where: { id: referral.id, tenantId: req.tenantId },
    data: { uses: { increment: 1 } },
  });
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId,
      actorId: req.user.userId,
      action: "REFERRAL_APPLIED",
      entity: "Referral",
      entityId: referral.id,
      payload: { couponUsd: 50 },
    },
  });
  return res.json({ data: { couponAmountUsd: 50 }, error: null });
});
