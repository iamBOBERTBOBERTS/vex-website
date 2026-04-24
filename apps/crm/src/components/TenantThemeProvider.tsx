"use client";

import { useEffect } from "react";
import { tenantThemeJsonSchema, type TenantThemeJson } from "@vex/shared";
import { getCrmApiBase } from "@/lib/runtimeConfig";

const API_BASE = getCrmApiBase();

function applyTheme(theme: TenantThemeJson | null) {
  const root = document.documentElement;
  if (!theme) {
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-2");
    root.style.removeProperty("--accent-soft");
    root.style.removeProperty("--bg-primary");
    root.style.removeProperty("--bg-secondary");
    root.style.removeProperty("--bg-card");
    root.style.removeProperty("--bg-card-strong");
    root.style.removeProperty("--text-primary");
    root.style.removeProperty("--text-secondary");
    root.style.removeProperty("--text-muted");
    root.style.removeProperty("--line");
    root.style.removeProperty("--line-soft");
    return;
  }
  const parsed = tenantThemeJsonSchema.safeParse(theme);
  const t = parsed.success ? parsed.data : theme;
  if (t.accent) root.style.setProperty("--accent", t.accent);
  if (t.accentSecondary) root.style.setProperty("--accent-2", t.accentSecondary);
  if (t.accentSoft) root.style.setProperty("--accent-soft", t.accentSoft);
  if (t.bgPrimary) root.style.setProperty("--bg-primary", t.bgPrimary);
  if (t.bgSecondary) root.style.setProperty("--bg-secondary", t.bgSecondary);
  if (t.bgCard) root.style.setProperty("--bg-card", t.bgCard);
  if (t.bgCardStrong) root.style.setProperty("--bg-card-strong", t.bgCardStrong);
  if (t.textPrimary) root.style.setProperty("--text-primary", t.textPrimary);
  if (t.textSecondary) root.style.setProperty("--text-secondary", t.textSecondary);
  if (t.textMuted) root.style.setProperty("--text-muted", t.textMuted);
  if (t.line) root.style.setProperty("--line", t.line);
  if (t.lineSoft) root.style.setProperty("--line-soft", t.lineSoft);
}

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!API_BASE) return;
    const domain =
      process.env.NEXT_PUBLIC_TENANT_DOMAIN || window.location.hostname;
    const ctrl = new AbortController();
    fetch(`${API_BASE}/public/branding?domain=${encodeURIComponent(domain)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((body) => {
        const data = body?.data as { theme?: Record<string, unknown> | null } | undefined;
        applyTheme((data?.theme as TenantThemeJson) ?? null);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return <>{children}</>;
}
