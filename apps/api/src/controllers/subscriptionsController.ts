import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { CreateSubscriptionInput } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();

export async function create(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const body = req.body as CreateSubscriptionInput;
  const expiresAt = new Date();
  if (body.billingInterval === "yearly") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  const sub = await prisma.subscription.create({
    data: {
      userId: user.userId,
      plan: body.plan,
      status: "ACTIVE",
      billingInterval: body.billingInterval ?? "monthly",
      amount: body.amount ?? (body.plan === "CHECK_MY_DEAL" ? 99 : 499),
      expiresAt,
    },
  });

  return res.status(201).json({
    id: sub.id,
    plan: sub.plan,
    status: sub.status,
    billingInterval: sub.billingInterval,
    amount: sub.amount != null ? Number(sub.amount) : null,
    expiresAt: sub.expiresAt,
    createdAt: sub.createdAt,
  });
}

export async function listMine(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const subs = await prisma.subscription.findMany({
    where: { userId: user.userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    subs.map((s) => ({
      id: s.id,
      plan: s.plan,
      status: s.status,
      billingInterval: s.billingInterval,
      amount: s.amount != null ? Number(s.amount) : null,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
    }))
  );
}
