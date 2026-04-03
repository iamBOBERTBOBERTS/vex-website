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
