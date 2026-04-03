import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import * as notificationsController from "../controllers/notificationsController.js";

export const notificationsRouter: Router = Router();

notificationsRouter.get("/", requireAuth, requireAnyAuthenticatedRole(), notificationsController.list);
notificationsRouter.patch("/:id/read", requireAuth, requireAnyAuthenticatedRole(), notificationsController.markRead);
