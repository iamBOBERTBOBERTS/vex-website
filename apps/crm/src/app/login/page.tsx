"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCrmApiHealthUrl } from "@/lib/runtimeConfig";

export default function CRMLoginPage() {
  const router = useRouter();
  const { token, loading, login } = useAuth();
  const healthUrl = getCrmApiHealthUrl();
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

  if (loading) return <div className="crm-shell" style={{ padding: "2rem 0", color: "var(--text-muted)" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <form onSubmit={handleSubmit} className="crm-panel crm-panel-strong" style={{ width: "100%", maxWidth: "360px", padding: "1.2rem" }}>
        <h1 style={{ marginBottom: "0.5rem", color: "var(--text-primary)", letterSpacing: "0.02em" }}>VEX CRM</h1>
        <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Staff sign in</p>
        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", marginBottom: "1rem" }} />
        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", marginBottom: "1rem" }} />
        {error && (
          <p style={{ color: "#e57373", marginBottom: "0.5rem", fontSize: "0.9rem" }}>{error}</p>
        )}
        {error && error.includes("Cannot reach API") && (
          <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem", fontSize: "0.8rem" }}>
            {healthUrl ? (
              <>
                Open <a href={healthUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>{healthUrl}</a> in a new tab to check if the API is running.
              </>
            ) : (
              <>Set <code style={{ fontSize: "0.75rem" }}>NEXT_PUBLIC_API_URL</code> to the live backend before retrying.</>
            )}{" "}
            Restart the CRM dev server after changing <code style={{ fontSize: "0.75rem" }}>.env.local</code>.
          </p>
        )}
        <button type="submit" disabled={submitting} className="crm-btn crm-btn-primary" style={{ width: "100%" }}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
