import type { NextFunction, Request, Response } from "express";
import { getTenantId, runWithTenant } from "../lib/tenant.js";

/**
 * Roadmap v3.0 — Days 1–3 Trust Layer (HTTP → ALS bridge).
 *
 * - `lib/tenant.ts` owns AsyncLocalStorage + tenant-scoped `prisma` (`$use` blocks `findUnique` / single-row `update` on tenant data).
 * - This module is the only supported way to enter ALS from Express after `req.tenantId` is resolved (see `middleware/tenant.ts`).
 * - Dealer/customer routes that touch tenant rows must run under `withTenantRequestContext`; scripts use `runWithTenant` / `withTenantScope` from `lib/tenant.js` directly.
 */
export function currentTenantId(): string | null {
  return getTenantId();
}

export function withTenantScope<T>(tenantId: string, fn: () => Promise<T> | T): Promise<T> | T {
  return runWithTenant(tenantId, fn);
}

/** Use at the start of sensitive services when called only from route handlers (defensive). */
export function requireActiveTenantContext(): string {
  const id = getTenantId();
  if (!id) {
    throw new Error("Tenant context missing — ensure tenant middleware or runWithTenant wraps this call");
  }
  return id;
}

/**
 * Attach tenant ALS context for downstream handlers.
 * Uses `req.tenantId` (resolved by tenant middleware) and falls back to JWT payload
 * for authenticated routes where middleware composition is custom.
 */
export function withTenantRequestContext(req: Request, res: Response, next: NextFunction): void {
  const tenantId = req.tenantId ?? req.user?.tenantId;
  if (!tenantId) {
    res.status(500).json({ code: "TENANT_SCOPE_ERROR", message: "Missing tenant context" });
    return;
  }
  void Promise.resolve(withTenantScope(tenantId, () => next())).catch(next);
}
