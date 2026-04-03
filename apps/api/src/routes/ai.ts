import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { insightsInputSchema } from "@vex/shared";
import { DealerInsightsService } from "../lib/ai.js";

const service = new DealerInsightsService();
export const aiRouter: Router = Router();

aiRouter.post("/insights", requireAuth, requireRole("STAFF", "ADMIN", "GROUP_ADMIN"), validateBody(insightsInputSchema), async (req, res) => {
  const body = req.body as { model: "PredictiveValuationTrend" | "LeadScore" | "ChurnRisk"; payload?: Record<string, unknown> };
  const out = await service.infer({
    tenantId: req.tenantId!,
    model: body.model,
    payload: body.payload ?? {},
  });
  return res.json({ data: out, error: null });
});
