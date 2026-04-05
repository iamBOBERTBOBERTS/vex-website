import { Router } from "express";
import { dmsSyncApiBodySchema } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { enqueueDmsSync, isQueueConfigured } from "../lib/queue.js";
import { DMSService } from "../lib/dms.js";

const service = new DMSService();
export const dmsRouter: Router = Router();

dmsRouter.post("/sync", requireAuth, requireRole("STAFF", "ADMIN", "GROUP_ADMIN"), validateBody(dmsSyncApiBodySchema), async (req, res) => {
  const body = req.body as { vendor: "vauto" | "dealertrack" | "cdk" | "cargurus"; mode?: "full" | "delta" };
  const mode = body.mode ?? "delta";
  const tenantId = req.tenantId!;

  if (isQueueConfigured()) {
    await enqueueDmsSync({ tenantId, vendor: body.vendor, mode });
    return res.status(202).json({
      data: { queued: true, vendor: body.vendor, mode },
      error: null,
    });
  }

  const out = await service.sync({
    tenantId,
    vendor: body.vendor,
    mode,
  });
  return res.json({ data: out, error: null });
});
