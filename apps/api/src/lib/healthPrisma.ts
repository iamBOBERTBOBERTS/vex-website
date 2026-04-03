import { PrismaClient } from "@prisma/client";

/**
 * Tiny dedicated client for `GET /health` only.
 * Do not attach tenant `$use` middleware — health runs without AsyncLocalStorage tenant context,
 * and the tenant-scoped `prisma` client's `$queryRaw` would hit the global middleware and throw "Tenant context missing".
 */
export const healthPrisma = new PrismaClient();
