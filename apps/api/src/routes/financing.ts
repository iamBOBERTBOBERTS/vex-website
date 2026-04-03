import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import { financingCalculateSchema } from "@vex/shared";
import * as financingController from "../controllers/financingController.js";

export const financingRouter: Router = Router();

financingRouter.post("/calculate", requireAnyAuthenticatedRole(), validateBody(financingCalculateSchema), financingController.calculate);
