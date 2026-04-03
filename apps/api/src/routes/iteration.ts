import { Router } from "express";
import { IterationFeedbackSchema } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole, requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { prisma } from "../lib/tenant.js";
import { PilotAnalyticsService } from "../lib/iteration.js";
import { enqueueIterationAnalysis } from "../lib/queue.js";

export const iterationRouter: Router = Router();
const service = new PilotAnalyticsService();

iterationRouter.get("/cohort", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const metric = await service.buildCohortMetric(req.tenantId!);
  return res.json({ data: metric, error: null });
});

iterationRouter.get("/backlog", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const rows = await prisma.iterationBacklog.findMany({
    where: { tenantId: req.tenantId! },
    orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
  return res.json({ data: rows, error: null });
});

iterationRouter.post("/feedback", requireAuth, requireAnyAuthenticatedRole(), validateBody(IterationFeedbackSchema), async (req, res) => {
  const body = req.body as { category: string; severity: string; title: string; details: string; source: string };
  const item = await prisma.iterationBacklog.create({
    data: {
      tenantId: req.tenantId!,
      priority: body.severity === "high" ? 10 : body.severity === "medium" ? 40 : 70,
      title: body.title,
      description: body.details,
      source: body.source,
      status: "open",
    },
  });
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId!,
      actorId: req.user?.userId,
      action: "ITERATION_FEEDBACK_SUBMITTED",
      entity: "IterationBacklog",
      entityId: item.id,
      payload: { category: body.category, severity: body.severity },
    },
  });
  return res.status(201).json({ data: item, error: null });
});

iterationRouter.post("/nightly-run", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  await enqueueIterationAnalysis({ tenantId: req.tenantId! });
  return res.json({ data: { queued: true }, error: null });
});
