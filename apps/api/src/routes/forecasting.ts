import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { buildMrrForecast, buildScenarioModel } from "../lib/forecasting.js";

export const forecastingRouter: Router = Router();

forecastingRouter.get("/mrr", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const forecast = await buildMrrForecast(req.tenantId!);
  return res.json({ data: forecast, error: null });
});

forecastingRouter.post("/scenario", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const currentMrr = Number(req.body?.currentMrr ?? 0);
  const acquisitionLiftPct = Number(req.body?.acquisitionLiftPct ?? 0);
  const churnDeltaPct = Number(req.body?.churnDeltaPct ?? 0);
  const scenario = buildScenarioModel({ currentMrr, acquisitionLiftPct, churnDeltaPct });
  return res.json({ data: scenario, error: null });
});
