import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole, requireRole } from "../middleware/requireRole.js";
import { createSubscriptionSchema } from "@vex/shared";
import * as subscriptionsController from "../controllers/subscriptionsController.js";

export const subscriptionsRouter: Router = Router();

subscriptionsRouter.post("/", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), validateBody(createSubscriptionSchema), subscriptionsController.create);
subscriptionsRouter.post(
  "/stripe/checkout-session",
  requireAuth,
  requireRole("ADMIN", "GROUP_ADMIN"),
  validateBody(createSubscriptionSchema),
  subscriptionsController.createStripeCheckoutSession
);
subscriptionsRouter.get("/me", requireAuth, requireAnyAuthenticatedRole(), subscriptionsController.listMine);
