import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import { shippingQuoteSchema } from "@vex/shared";
import * as shippingController from "../controllers/shippingController.js";

export const shippingRouter: Router = Router();

shippingRouter.post("/quote", requireAnyAuthenticatedRole(), validateBody(shippingQuoteSchema), shippingController.quote);
