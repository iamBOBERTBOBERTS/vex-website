"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function CRMHome() {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (token) router.replace("/dashboard");
    else router.replace("/login");
  }, [loading, token, router]);

  return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;
}
