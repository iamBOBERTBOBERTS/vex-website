export enum Role {
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
}

export type RoleValue = `${Role}`;

/**
 * Legacy/extended API role set used by the current backend.
 * GROUP_ADMIN remains supported for hierarchy-aware admin flows.
 */
export type ApiRole = RoleValue | "GROUP_ADMIN";

export const AUTHENTICATED_ROLES: readonly ApiRole[] = [
  Role.CUSTOMER,
  Role.STAFF,
  Role.ADMIN,
  "GROUP_ADMIN",
];

/** Roles allowed to use the dealer CRM app (matches API `isDealerStaffRole`). */
export function isCrmPortalRole(role: string): boolean {
  return role === Role.STAFF || role === Role.ADMIN || role === "GROUP_ADMIN";
}

/** Deal desk pilot routes: STAFF + ADMIN only (tenant deal desk / public appraisal queue). */
export function isDealDeskRole(role: string): boolean {
  return role === Role.STAFF || role === Role.ADMIN;
}

export const ROLE_PERMISSIONS: Readonly<Record<ApiRole, readonly string[]>> = {
  CUSTOMER: [
    "appraisal:create:own",
    "appraisal:view:own",
    "order:create:own",
    "order:view:own",
  ],
  STAFF: [
    "inventory:read",
    "inventory:write",
    "appraisal:read",
    "appraisal:write",
    "crm:read",
    "crm:write",
  ],
  ADMIN: [
    "inventory:read",
    "inventory:write",
    "appraisal:read",
    "appraisal:write",
    "crm:read",
    "crm:write",
    "billing:read",
    "billing:write",
    "tenant:admin",
    "global:admin",
  ],
  GROUP_ADMIN: [
    "inventory:read",
    "inventory:write",
    "appraisal:read",
    "appraisal:write",
    "crm:read",
    "crm:write",
    "billing:read",
    "billing:write",
    "tenant:admin",
    "global:admin",
    "group:admin",
  ],
};
