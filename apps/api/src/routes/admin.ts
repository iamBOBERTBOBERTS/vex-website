import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import * as adminController from "../controllers/adminController.js";

export const adminRouter: Router = Router();

adminRouter.get("/overview", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), adminController.overview);
adminRouter.get("/mrr", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), adminController.mrr);
