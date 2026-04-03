import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import { createOrderSchema, updateOrderSchema } from "@vex/shared";
import * as ordersController from "../controllers/ordersController.js";

export const ordersRouter: Router = Router();

ordersRouter.post("/", requireAuth, requireAnyAuthenticatedRole(), validateBody(createOrderSchema), ordersController.create);
ordersRouter.get("/", requireAuth, requireAnyAuthenticatedRole(), ordersController.list);
ordersRouter.get("/:id", requireAuth, requireAnyAuthenticatedRole(), ordersController.getById);
ordersRouter.patch("/:id", requireAuth, requireAnyAuthenticatedRole(), validateBody(updateOrderSchema), ordersController.update);
ordersRouter.put("/:id", requireAuth, requireAnyAuthenticatedRole(), validateBody(updateOrderSchema), ordersController.update);
ordersRouter.delete("/:id", requireAuth, requireAnyAuthenticatedRole(), ordersController.remove);
