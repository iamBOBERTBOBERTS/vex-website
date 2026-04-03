import { Router } from "express";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import * as vehiclesController from "../controllers/vehiclesController.js";

export const vehiclesRouter: Router = Router();

vehiclesRouter.get("/", requireAnyAuthenticatedRole(), vehiclesController.list);
vehiclesRouter.get("/:id/options", requireAnyAuthenticatedRole(), vehiclesController.getOptions);
