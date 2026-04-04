import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import * as appraisalsController from "../controllers/appraisalsController.js";
import { getPilotSeedNetworkMetrics } from "../lib/pilotMetrics.js";

export const dealerRouter: Router = Router();

/**
 * Cross-tenant pilot seed metrics for ops / investor proxy only.
 * Not available to tenant JWTs (would leak network-wide aggregates).
 * Authenticate with header `x-internal-key: <INTERNAL_PILOT_METRICS_KEY>` or `?key=` (same value).
 */
dealerRouter.get("/pilots", async (req, res) => {
  const headerKey = req.header("x-internal-key");
  const q = req.query["key"];
  const key = (typeof headerKey === "string" && headerKey) || (typeof q === "string" ? q : "");
  const expected = process.env.INTERNAL_PILOT_METRICS_KEY;
  if (!expected) {
    return res.status(503).json({
      code: "NOT_CONFIGURED",
      message: "INTERNAL_PILOT_METRICS_KEY is not set on the API",
    });
  }
  if (key !== expected) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid or missing internal key" });
  }
  const data = await getPilotSeedNetworkMetrics();
  return res.json({ data, error: null });
});

const dealDeskUpdateSchema = z
  .object({
    status: z.enum(["OPEN", "ACCEPTED", "REJECTED", "NEGOTIATING", "CLOSED"]),
    note: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "CLOSED") {
      const n = data.note?.trim() ?? "";
      if (n.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Close requires a short internal note (at least 3 characters).",
          path: ["note"],
        });
      }
    }
  });
const addToInventorySchema = z.object({
  listPrice: z.number().positive().optional(),
  location: z.string().max(200).optional(),
});

dealerRouter.get("/appraisals", requireAuth, requireRole("STAFF", "ADMIN", "GROUP_ADMIN"), appraisalsController.list);
dealerRouter.get(
  "/appraisals/:id",
  requireAuth,
  requireRole("STAFF", "ADMIN", "GROUP_ADMIN"),
  appraisalsController.getById
);
dealerRouter.post(
  "/appraisals/:id/status",
  requireAuth,
  requireRole("STAFF", "ADMIN", "GROUP_ADMIN"),
  validateBody(dealDeskUpdateSchema),
  appraisalsController.openDealDesk
);
dealerRouter.post(
  "/appraisals/:id/add-to-inventory",
  requireAuth,
  requireRole("STAFF", "ADMIN", "GROUP_ADMIN"),
  validateBody(addToInventorySchema),
  appraisalsController.addToInventoryFromAppraisal
);

