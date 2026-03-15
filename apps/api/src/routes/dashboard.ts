import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as dashboardController from "../controllers/dashboardController.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", requireAuth, dashboardController.stats);
