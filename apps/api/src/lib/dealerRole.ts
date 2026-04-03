/** Roles that may perform dealer CRM / back-office actions for the active tenant. */
export function isDealerStaffRole(role: string): boolean {
  return role === "STAFF" || role === "ADMIN" || role === "GROUP_ADMIN";
}

/** Deal desk appraisal list/detail/close — STAFF + ADMIN only (matches `requireRole` on `/dealer/appraisals/*`). */
export function isDealDeskAppraisalRole(role: string): boolean {
  return role === "STAFF" || role === "ADMIN";
}
