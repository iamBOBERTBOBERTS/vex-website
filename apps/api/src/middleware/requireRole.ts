import { Request, Response, NextFunction } from "express";

export type ApiRole = "CUSTOMER" | "STAFF" | "ADMIN" | "GROUP_ADMIN";

/** Every valid JWT role — use for tenant-scoped consumer + staff routes. */
export const AUTHENTICATED_ROLES: readonly ApiRole[] = ["CUSTOMER", "STAFF", "ADMIN", "GROUP_ADMIN"];

export function requireRole(...roles: ApiRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Login required" });
    if (!roles.includes(user.role as ApiRole)) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Insufficient role" });
    }
    next();
  };
}

/** Shorthand: any logged-in user with a valid role (same as spreading AUTHENTICATED_ROLES). */
export function requireAnyAuthenticatedRole() {
  return requireRole("CUSTOMER", "STAFF", "ADMIN", "GROUP_ADMIN");
}

export function requireStaffOrAbove() {
  return requireRole("STAFF", "ADMIN", "GROUP_ADMIN");
}
