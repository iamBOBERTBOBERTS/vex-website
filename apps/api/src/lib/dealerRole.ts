/** Roles that may perform dealer CRM / back-office actions for the active tenant. */
export function isDealerStaffRole(role: string): boolean {
  return role === "STAFF" || role === "ADMIN" || role === "GROUP_ADMIN";
}

/**
 * Deal desk + appraisal list/detail (tenant `/appraisals/*` and `/dealer/appraisals/*`).
 * Same roster as `isDealerStaffRole` so route `requireRole` and controller checks stay aligned (see TENANT_RBAC.md).
 */
export function isDealDeskAppraisalRole(role: string): boolean {
  return isDealerStaffRole(role);
}
