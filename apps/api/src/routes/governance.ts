import { Router } from "express";
import { BoardResolutionSchema } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { createEquityGrant, generateBoardPack } from "../lib/governance.js";
import { prisma } from "../lib/tenant.js";

export const governanceRouter: Router = Router();

governanceRouter.get("/board-pack", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const pack = await generateBoardPack(req.tenantId!);
  return res.json({ data: pack, error: null });
});

governanceRouter.post("/equity-grants", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), async (req, res) => {
  const grant = await createEquityGrant(req.tenantId!, req.body);
  return res.status(201).json({ data: grant, error: null });
});

governanceRouter.post("/resolutions", requireAuth, requireRole("ADMIN", "GROUP_ADMIN"), validateBody(BoardResolutionSchema), async (req, res) => {
  const resolution = req.body;
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantId!,
      actorId: req.user?.userId,
      action: "BOARD_RESOLUTION_RECORDED",
      entity: "BoardResolution",
      entityId: resolution.title,
      payload: resolution,
    },
  });
  return res.status(201).json({ data: resolution, error: null });
});
