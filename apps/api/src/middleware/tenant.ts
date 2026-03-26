import { Request, Response, NextFunction } from "express";
import { authJwtSchema } from "@vex/shared";
import { requireAuth } from "./auth.js";
import { runWithTenant, basePrisma } from "../lib/tenant.js";

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Allow system endpoints to stay unauthenticated.
  if (req.path === "/health" || req.path === "/") return next();
  if (req.path === "/metrics") return next();
  if (req.path.startsWith("/webhooks/")) return next();
  if (req.path.startsWith("/stripe/webhook")) return next();
  if (req.path === "/pricing/plans" && req.method === "GET") return next();
  if (req.path === "/auth/register" || req.path === "/auth/login" || req.path === "/auth/refresh") return next();
  if (req.path.startsWith("/public/")) return next();
  if (req.path.startsWith("/onboard/")) return next();
  if (req.path.startsWith("/pilot/")) return next();

  return requireAuth(req, res, async () => {
    const attempted =
      (req.body && typeof req.body === "object" && "tenantId" in (req.body as Record<string, unknown>)) ||
      (req.query && typeof req.query === "object" && "tenantId" in (req.query as Record<string, unknown>));
    if (attempted) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Do not pass tenantId via request body or query" });
    }

    const parsed = authJwtSchema.safeParse(req.user);
    if (!parsed.success) {
      return res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid auth token" });
    }

    let tenantId = parsed.data.tenantId;

    if (parsed.data.role === "ADMIN" || parsed.data.role === "GROUP_ADMIN") {
      const override = req.header("x-tenant-override");
      if (override) {
        const groupScopeAllowed = req.header("x-group-scope") === "true";
        if (parsed.data.role === "GROUP_ADMIN" && !groupScopeAllowed) {
          return res.status(403).json({ code: "FORBIDDEN", message: "GROUP_ADMIN override requires x-group-scope=true" });
        }
        const exists = await basePrisma.tenant.findUnique({ where: { id: override } });
        if (!exists) return res.status(404).json({ code: "NOT_FOUND", message: "Tenant override not found" });
        if (parsed.data.role === "GROUP_ADMIN") {
          // GROUP_ADMIN may only override into their own tenant hierarchy.
          if (override !== parsed.data.tenantId) {
            let cursor: string | null = override;
            let allowed = false;
            for (let i = 0; i < 16 && cursor; i += 1) {
              const t = await basePrisma.tenant.findFirst({
                where: { id: cursor },
                select: { id: true, parentTenantId: true },
              });
              if (!t) break;
              if (t.parentTenantId === parsed.data.tenantId) {
                allowed = true;
                break;
              }
              cursor = t.parentTenantId;
            }
            if (!allowed) {
              return res.status(403).json({ code: "FORBIDDEN", message: "Tenant override not in GROUP_ADMIN hierarchy" });
            }
          }
        }
        tenantId = override;
      }
    }

    req.tenantId = tenantId;

    return runWithTenant(tenantId, () => next());
  });
}

