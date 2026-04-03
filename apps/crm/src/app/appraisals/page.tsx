/**
 * Deal desk list: the CRM bundle only calls GET /dealer/appraisals.
 * The API resolves the tenant from the JWT, runs tenant middleware, and uses the Prisma client bound to
 * AsyncLocalStorage (see apps/api/src/lib/tenant.ts) so queries cannot escape the active tenant.
 */
import dynamic from "next/dynamic";

const AppraisalsClient = dynamic(() => import("./AppraisalsClient").then((m) => m.AppraisalsClient), {
  loading: () => (
    <main className="crm-shell">
      <div className="crm-panel" style={{ padding: "1rem" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading appraisals...</p>
      </div>
    </main>
  ),
  ssr: false,
});

export default function AppraisalsListPage() {
  return <AppraisalsClient />;
}
