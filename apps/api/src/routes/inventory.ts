import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole, requireStaffOrAbove } from "../middleware/requireRole.js";
import { createInventorySchema, updateInventorySchema } from "@vex/shared";
import * as inventoryController from "../controllers/inventoryController.js";

export const inventoryRouter: Router = Router();

inventoryRouter.get("/", requireAnyAuthenticatedRole(), inventoryController.list);
inventoryRouter.get("/:id", requireAnyAuthenticatedRole(), inventoryController.getById);
inventoryRouter.post("/", requireAuth, requireAnyAuthenticatedRole(), validateBody(createInventorySchema), inventoryController.create);
inventoryRouter.patch("/:id", requireAuth, requireAnyAuthenticatedRole(), validateBody(updateInventorySchema), inventoryController.update);
inventoryRouter.put("/:id", requireAuth, requireAnyAuthenticatedRole(), validateBody(updateInventorySchema), inventoryController.update);
inventoryRouter.delete("/:id", requireAuth, requireStaffOrAbove(), inventoryController.remove);
