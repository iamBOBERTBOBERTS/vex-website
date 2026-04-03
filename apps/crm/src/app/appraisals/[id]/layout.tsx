import type { ReactNode } from "react";

/** Parent `appraisals/layout` already applies staff shell; avoid double nav. */
export default function AppraisalIdLayout({ children }: { children: ReactNode }) {
  return children;
}
