"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function CRMLoginPage() {
  const router = useRouter();
  const { token, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && token) router.replace("/dashboard");
  }, [loading, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem", color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "320px" }}>
        <h1 style={{ marginBottom: "0.5rem", color: "var(--text-primary)" }}>VEX CRM</h1>
        <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Staff sign in</p>
        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", marginBottom: "1rem" }} />
        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", marginBottom: "1rem" }} />
        {error && <p style={{ color: "#e57373", marginBottom: "0.5rem", fontSize: "0.9rem" }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ width: "100%", padding: "0.6rem", background: "var(--accent)", color: "#0d0d0d", border: "none", borderRadius: "6px", fontWeight: 600 }}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
