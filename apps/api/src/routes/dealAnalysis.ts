import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireStaffOrAbove } from "../middleware/requireRole.js";
import { dealAnalysisSchema } from "@vex/shared";
import * as dealAnalysisController from "../controllers/dealAnalysisController.js";

export const dealAnalysisRouter: Router = Router();

dealAnalysisRouter.post("/", requireAuth, requireStaffOrAbove(), validateBody(dealAnalysisSchema), dealAnalysisController.run);
