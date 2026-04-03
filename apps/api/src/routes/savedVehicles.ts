import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import { createSavedVehicleSchema } from "@vex/shared";
import * as savedVehiclesController from "../controllers/savedVehiclesController.js";

export const savedVehiclesRouter: Router = Router();

savedVehiclesRouter.get("/", requireAuth, requireAnyAuthenticatedRole(), savedVehiclesController.list);
savedVehiclesRouter.post("/", requireAuth, requireAnyAuthenticatedRole(), validateBody(createSavedVehicleSchema), savedVehiclesController.create);
savedVehiclesRouter.delete("/:id", requireAuth, requireAnyAuthenticatedRole(), savedVehiclesController.remove);
