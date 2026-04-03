"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Nav } from "@/components/Nav";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  if (loading) {
    return (
      <main className="crm-shell">
        <div className="crm-panel" style={{ padding: "1rem", color: "var(--text-muted)" }}>
          Loading workspace...
        </div>
      </main>
    );
  }
  if (!token) return null;

  return (
    <>
      <Nav />
      <OnboardingWizard />
      {children}
    </>
  );
}
