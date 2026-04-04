"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isDealDeskRole } from "@vex/shared";

/**
 * Paths that require deal-desk RBAC (STAFF | ADMIN). Excludes internal tools like /appraisals/new.
 * Middleware cannot read JWT from localStorage, so this is the route-level guard for the appraisals subtree.
 */
export function appraisalPathRequiresDealDeskRole(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/appraisals") return true;
  if (!normalized.startsWith("/appraisals/")) return false;
  const rest = normalized.slice("/appraisals/".length);
  const segment = rest.split("/").filter(Boolean)[0];
  if (!segment) return true;
  if (segment === "new" || segment === "offline") return false;
  return true;
}

export function DealDeskRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { role, loading, token } = useAuth();
  const needs = appraisalPathRequiresDealDeskRole(pathname);

  useEffect(() => {
    if (!needs || loading || !token || !role) return;
    if (!isDealDeskRole(role)) {
      router.replace("/dashboard");
    }
  }, [needs, loading, token, role, router]);

  if (!needs) return children;

  if (loading || !token) return children;

  if (role && !isDealDeskRole(role)) {
    return (
      <main style={{ padding: "1.5rem", maxWidth: "560px", margin: "0 auto" }} aria-busy="true" aria-label="Redirecting to dashboard">
        <p style={{ color: "var(--text-muted)" }}>You don’t have access to the deal desk. Redirecting…</p>
      </main>
    );
  }

  return children;
}
