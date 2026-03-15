import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { dealAnalysisSchema } from "@vex/shared";
import * as dealAnalysisController from "../controllers/dealAnalysisController.js";

export const dealAnalysisRouter = Router();

dealAnalysisRouter.post("/", requireAuth, validateBody(dealAnalysisSchema), dealAnalysisController.run);
