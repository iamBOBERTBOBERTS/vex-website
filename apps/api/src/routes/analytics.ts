import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import * as analyticsController from "../controllers/analyticsController.js";

export const analyticsRouter: Router = Router();

analyticsRouter.get("/", requireAuth, requireRole("STAFF", "ADMIN", "GROUP_ADMIN"), analyticsController.getAnalytics);
