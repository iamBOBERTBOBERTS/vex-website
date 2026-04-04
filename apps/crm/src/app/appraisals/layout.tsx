import StaffLayout from "../(staff)/layout";
import { DealDeskRouteGuard } from "@/components/DealDeskRouteGuard";
import type { ReactNode } from "react";

/** Deal desk routes share the authenticated staff shell; list + detail are STAFF/ADMIN-only at the layout (route) level. */
export default function AppraisalsLayout({ children }: { children: ReactNode }) {
  return (
    <StaffLayout>
      <DealDeskRouteGuard>{children}</DealDeskRouteGuard>
    </StaffLayout>
  );
}
