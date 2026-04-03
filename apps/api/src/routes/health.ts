import { Router } from "express";
import { healthPrisma } from "../lib/healthPrisma.js";

export const healthRouter: Router = Router();

healthRouter.get("/", async (_req, res) => {
  let db: "ok" | "error" = "ok";
  try {
    await healthPrisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }

  const status = db === "ok" ? "ok" : "degraded";
  res.status(db === "ok" ? 200 : 503).json({
    api: "@vex/api",
    status,
    db,
    message: db === "ok" ? "VEX backend is live" : "Database unreachable",
    endpoints: {
      health: "GET /health → server check",
      auth: [
        "POST /auth/register → create account",
        "POST /auth/login → get JWT",
        "GET /auth/me → current user (needs token)",
      ],
      vehicles: "GET /vehicles, GET /vehicles/:id/options",
      inventory: "GET /inventory (filters), GET /inventory/:id, POST/PATCH /inventory (auth)",
    },
    note: "Use this endpoint for production load balancers and uptime monitors",
    timestamp: new Date().toISOString(),
  });
});
