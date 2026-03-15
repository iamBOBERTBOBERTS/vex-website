import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { createSubscriptionSchema } from "@vex/shared";
import * as subscriptionsController from "../controllers/subscriptionsController.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.post("/", requireAuth, validateBody(createSubscriptionSchema), subscriptionsController.create);
subscriptionsRouter.get("/me", requireAuth, subscriptionsController.listMine);
