import StaffLayout from "../(staff)/layout";
import type { ReactNode } from "react";

/** Deal desk routes share the authenticated staff shell (nav, session gate). */
export default function AppraisalsLayout({ children }: { children: ReactNode }) {
  return <StaffLayout>{children}</StaffLayout>;
}
