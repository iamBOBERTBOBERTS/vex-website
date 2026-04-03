import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireStaffOrAbove } from "../middleware/requireRole.js";
import * as dashboardController from "../controllers/dashboardController.js";

export const dashboardRouter: Router = Router();

dashboardRouter.get("/stats", requireAuth, requireStaffOrAbove(), dashboardController.stats);
