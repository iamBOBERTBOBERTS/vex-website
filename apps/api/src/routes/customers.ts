import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireStaffOrAbove } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { createCustomerSchema, updateCustomerSchema } from "@vex/shared";
import * as customersController from "../controllers/customersController.js";

export const customersRouter: Router = Router();

customersRouter.get("/", requireAuth, requireStaffOrAbove(), customersController.list);
customersRouter.post("/", requireAuth, requireStaffOrAbove(), validateBody(createCustomerSchema), customersController.create);
customersRouter.get("/:id", requireAuth, requireStaffOrAbove(), customersController.getById);
customersRouter.put("/:id", requireAuth, requireStaffOrAbove(), validateBody(updateCustomerSchema), customersController.update);
customersRouter.delete("/:id", requireAuth, requireStaffOrAbove(), customersController.remove);
