"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Nav } from "@/components/Nav";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  if (loading) return <div style={{ padding: "2rem", color: "var(--text-muted)" }}>Loading…</div>;
  if (!token) return null;

  return (
    <>
      <Nav />
      {children}
    </>
  );
}
