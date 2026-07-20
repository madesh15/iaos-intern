const SLUG = "logistics_freight";

const reports = [
  { title: "Dashboard Summary Report", desc: "Executive summary of all logistics KPIs and metrics", icon: "📊" },
  { title: "Audit Findings Report", desc: "Complete audit findings with severity, impact and recommendations", icon: "📋" },
  { title: "Carrier Performance Report", desc: "Carrier scorecard with on-time %, damage %, and claim analysis", icon: "🚚" },
  { title: "Cost Analysis Report", desc: "Freight cost trends, rate compliance, and savings opportunities", icon: "💰" },
  { title: "Rate Compliance Report", desc: "Contract rate vs billed rate comparison with overbilling analysis", icon: "📈" },
  { title: "SLA Breach Report", desc: "Transit time SLA compliance and delay analysis", icon: "⚠" },
  { title: "Claim Analysis Report", desc: "Claim trends, recovery rates, and aging analysis", icon: "📑" },
  { title: "Route Efficiency Report", desc: "Route distance variance, mode optimization, and backhaul utilization", icon: "🛣️" },
  { title: "Duplicate Billing Report", desc: "Duplicate invoice, LR and shipment detection", icon: "🔍" },
  { title: "Fuel Surcharge Audit Report", desc: "Fuel surcharge validation using index-based formula", icon: "⛽" },
];

export default function ReportsPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Reports</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {reports.map((r) => (
          <div key={r.title} className="card" style={{ padding: 18, cursor: "pointer" }}
            onClick={() => window.open(`/api/modules/${SLUG}/export/shipments/csv`, "_blank")}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</div>
            <h4 style={{ marginBottom: 4 }}>{r.title}</h4>
            <p style={{ fontSize: 12, color: "var(--slate)", margin: 0 }}>{r.desc}</p>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <span className="badge">PDF</span>
              <span className="badge">Excel</span>
              <span className="badge" style={{ background: "var(--bg)", color: "var(--slate)" }}>Print</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20, marginTop: 24 }}>
        <h4 style={{ marginBottom: 12 }}>Export Data</h4>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href={`/api/modules/${SLUG}/export/shipments/csv`}>Shipments CSV</a>
          <a className="btn btn-primary" href={`/api/modules/${SLUG}/export/invoices/csv`}>Invoices CSV</a>
          <a className="btn btn-primary" href={`/api/modules/${SLUG}/export/findings/csv`}>Findings CSV</a>
          <a className="btn btn-primary" href={`/api/modules/${SLUG}/export/carriers/csv`}>Carriers CSV</a>
          <a className="btn btn-primary" href={`/api/modules/${SLUG}/export/claims/csv`}>Claims CSV</a>
        </div>
      </div>
    </div>
  );
}
