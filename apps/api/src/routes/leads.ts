import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole, requireStaffOrAbove } from "../middleware/requireRole.js";
import { createLeadSchema, updateLeadSchema } from "@vex/shared";
import * as leadsController from "../controllers/leadsController.js";

export const leadsRouter: Router = Router();

leadsRouter.get("/", requireAuth, requireStaffOrAbove(), leadsController.list);
leadsRouter.post("/", requireAuth, requireAnyAuthenticatedRole(), validateBody(createLeadSchema), leadsController.create);
leadsRouter.get("/:id", requireAuth, requireStaffOrAbove(), leadsController.getById);
leadsRouter.patch("/:id", requireAuth, requireStaffOrAbove(), validateBody(updateLeadSchema), leadsController.update);
leadsRouter.put("/:id", requireAuth, requireStaffOrAbove(), validateBody(updateLeadSchema), leadsController.update);
leadsRouter.delete("/:id", requireAuth, requireStaffOrAbove(), leadsController.remove);
