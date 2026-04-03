import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { simulateLiquidity } from "../lib/liquidity.js";

export const liquidityRouter: Router = Router();

liquidityRouter.get("/simulate", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const sim = await simulateLiquidity(req.tenantId!);
  return res.json({ data: sim, error: null });
});
