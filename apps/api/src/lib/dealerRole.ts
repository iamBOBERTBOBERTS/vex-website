/** Roles that may perform dealer CRM / back-office actions for the active tenant. */
export function isDealerStaffRole(role: string): boolean {
  return role === "STAFF" || role === "ADMIN" || role === "GROUP_ADMIN";
}
