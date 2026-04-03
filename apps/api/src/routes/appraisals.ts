import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { createAppraisalSchema, updateAppraisalSchema, ValuationInputSchema } from "@vex/shared";
import * as appraisalsController from "../controllers/appraisalsController.js";

export const appraisalsRouter: Router = Router();

appraisalsRouter.get("/", requireAuth, requireRole("STAFF", "ADMIN", "GROUP_ADMIN"), appraisalsController.list);
appraisalsRouter.post(
  "/",
  requireAuth,
  requireRole("STAFF", "ADMIN", "GROUP_ADMIN"),
  validateBody(createAppraisalSchema),
  appraisalsController.create
);
appraisalsRouter.post(
  "/valuate",
  requireAuth,
  requireRole("STAFF", "ADMIN", "GROUP_ADMIN"),
  validateBody(ValuationInputSchema),
  appraisalsController.valuate
);

appraisalsRouter.put(
  "/:id",
  requireAuth,
  requireRole("STAFF", "ADMIN", "GROUP_ADMIN"),
  validateBody(updateAppraisalSchema),
  appraisalsController.update
);
appraisalsRouter.delete("/:id", requireAuth, requireRole("STAFF", "ADMIN", "GROUP_ADMIN"), appraisalsController.remove);
appraisalsRouter.get("/:id", requireAuth, requireRole("STAFF", "ADMIN", "GROUP_ADMIN"), appraisalsController.getById);
