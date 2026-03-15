import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as notificationsController from "../controllers/notificationsController.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, notificationsController.list);
notificationsRouter.patch("/:id/read", requireAuth, notificationsController.markRead);
