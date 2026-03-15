import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as customersController from "../controllers/customersController.js";

export const customersRouter = Router();

customersRouter.get("/", requireAuth, customersController.list);
customersRouter.get("/:id", requireAuth, customersController.getById);
