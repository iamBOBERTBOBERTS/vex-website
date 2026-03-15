import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();

export async function list(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where: { userId: user.userId } }),
  ]);

  return res.json({
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      readAt: n.readAt,
      createdAt: n.createdAt,
    })),
    total,
    limit,
    offset,
  });
}

export async function markRead(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const { id } = req.params;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return res.status(404).json({ code: "NOT_FOUND", message: "Notification not found" });
  if (notification.userId !== user.userId) return res.status(403).json({ code: "FORBIDDEN", message: "Not your notification" });

  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return res.json({ id, readAt: new Date().toISOString() });
}
