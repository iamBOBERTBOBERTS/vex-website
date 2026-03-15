import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { DealAnalysisInput } from "@vex/shared";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();

export async function run(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });

  const body = req.body as DealAnalysisInput;

  const active = await prisma.subscription.findFirst({
    where: { userId: user.userId, plan: "CHECK_MY_DEAL", status: "ACTIVE", expiresAt: { gte: new Date() } },
  });

  if (!active) {
    return res.status(403).json({
      code: "SUBSCRIPTION_REQUIRED",
      message: "Check My Deal subscription required. Subscribe at checkout or in your portal.",
    });
  }

  const recommendations: string[] = [];
  const financing = body.financing as { termMonths?: number; monthlyPayment?: number; apr?: number } | undefined;
  const total = body.totalAmount ?? 0;

  if (financing?.termMonths && financing.termMonths < 36 && total > 50000) {
    recommendations.push("Consider a longer term (e.g. 48–60 months) to lower your monthly payment on this vehicle.");
  }
  if (financing?.apr && financing.apr > 8) {
    recommendations.push("Your current APR is on the higher side. Check with our financing partners for pre-approved rates.");
  }
  if (!body.shipping && total > 0) {
    recommendations.push("Add shipping to your quote for a complete door-to-door cost.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Your deal structure looks solid. Ready to proceed when you are.");
  }

  return res.json({ recommendations });
}
