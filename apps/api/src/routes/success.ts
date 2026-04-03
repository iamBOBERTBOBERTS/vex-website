import { Router } from "express";
import { PilotFeedbackSchema } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { prisma } from "../lib/tenant.js";
import { enqueuePilotSuccessNudge } from "../lib/queue.js";

export const successRouter: Router = Router();

successRouter.post("/feedback", requireAuth, requireAnyAuthenticatedRole(), validateBody(PilotFeedbackSchema), async (req, res) => {
  const user = req.user;
  if (!user || !req.tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  const body = req.body as { rating: number; message: string; channel: "in_app" | "email" | "sms" };

  const feedback = await prisma.growthMetric.create({
    data: {
      tenantId: req.tenantId,
      key: "pilot_feedback",
      value: body.rating,
      meta: { message: body.message, channel: body.channel, userId: user.userId },
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId,
      actorId: user.userId,
      action: "PILOT_FEEDBACK_SUBMITTED",
      entity: "GrowthMetric",
      entityId: feedback.id,
      payload: { rating: body.rating, channel: body.channel },
    },
  });

  return res.status(201).json({ data: { id: feedback.id }, error: null });
});

successRouter.post("/sequence/trigger", requireAuth, requireAnyAuthenticatedRole(), async (req, res) => {
  const user = req.user;
  if (!user || !req.tenantId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
  const stepRaw = typeof (req.body as { step?: unknown }).step === "string" ? String((req.body as { step?: string }).step) : "welcome";
  const step = stepRaw === "first_appraisal_24h" || stepRaw === "nps_7d" ? stepRaw : "welcome";
  const me = await prisma.user.findFirst({ where: { id: user.userId }, select: { email: true, phone: true } });
  await enqueuePilotSuccessNudge({
    tenantId: req.tenantId,
    userId: user.userId,
    email: me?.email ?? undefined,
    phone: me?.phone ?? undefined,
    step,
  });
  return res.json({ data: { queued: true, step }, error: null });
});
