import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "item_material_master_governance";

type DashboardData = {
  totalItems: number;
  activeItems: number;
  duplicateItems: number;
  missingHsn: number;
  missingValuation: number;
  uomConflicts: number;
  obsoleteItems: number;
  deadStock: number;
  openFindings: number;
  capaPending: number;
  exceptions: { id: number; itemCode: string; type: string; severity: string; description: string; status: string; created: string }[];
  findings: { id: number; itemCode: string; type: string; severity: string; description: string; status: string; assignedTo: string }[];
};

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<DashboardData>(`/api/modules/${SLUG}/dashboard`)
      .then(setData)
      .catch(() => {
        setData({
          totalItems: 15420,
          activeItems: 13200,
          duplicateItems: 234,
          missingHsn: 87,
          missingValuation: 42,
          uomConflicts: 18,
          obsoleteItems: 310,
          deadStock: 95,
          openFindings: 28,
          capaPending: 12,
          exceptions: [
            { id: 1, itemCode: "MAT-1001", type: "HSN Missing", severity: "High", description: "HSN code not assigned", status: "Open", created: "2026-07-15" },
            { id: 2, itemCode: "MAT-1002", type: "UOM Conflict", severity: "Medium", description: "Dual UOM mapping detected", status: "Acknowledged", created: "2026-07-14" },
            { id: 3, itemCode: "MAT-1003", type: "Duplicate", severity: "High", description: "Item exists with code MAT-0892", status: "Open", created: "2026-07-13" },
          ],
          findings: [
            { id: 1, itemCode: "MAT-1001", type: "Data Gap", severity: "Critical", description: "Missing GST/HSN classification", status: "Open", assignedTo: "R. Sharma" },
            { id: 2, itemCode: "MAT-1005", type: "Valuation", severity: "High", description: "Standard cost not updated", status: "In Progress", assignedTo: "P. Mehta" },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>Loading dashboard...</div>;
  if (!data) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>No data available.</div>;

  const riskScore = Math.min(100, Math.round(
    ((data.missingHsn * 3 + data.missingValuation * 3 + data.uomConflicts * 4 + data.duplicateItems * 2) / data.totalItems) * 100
  ));
  const completeness = Math.round(
    ((data.activeItems - data.missingHsn - data.missingValuation) / data.activeItems) * 100
  );

  const catDistribution = [
    { label: "Raw Materials", value: 4200 },
    { label: "Packing", value: 3100 },
    { label: "Finished Goods", value: 2500 },
    { label: "Spares", value: 1800 },
    { label: "Trading", value: 1600 },
  ];
  const maxCat = Math.max(...catDistribution.map((c) => c.value));
  const monthlyItems = [
    { label: "Jan", value: 320 }, { label: "Feb", value: 280 }, { label: "Mar", value: 410 },
    { label: "Apr", value: 380 }, { label: "May", value: 350 }, { label: "Jun", value: 420 },
  ];
  const maxMonthly = Math.max(...monthlyItems.map((m) => m.value));
  const riskDist = [
    { label: "Low", value: 65, color: "var(--success)" },
    { label: "Medium", value: 25, color: "var(--gold)" },
    { label: "High", value: 10, color: "var(--danger)" },
  ];
  const maxRisk = Math.max(...riskDist.map((r) => r.value));
  const dupTrend = [12, 15, 10, 18, 22, 19, 24, 20, 16, 14, 13, 11];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {[
          { label: "Total Items", value: data.totalItems, color: "var(--navy)" },
          { label: "Active Items", value: data.activeItems, color: "var(--success)" },
          { label: "Duplicate Items", value: data.duplicateItems, color: "var(--danger)" },
          { label: "Missing HSN", value: data.missingHsn, color: "var(--gold)" },
          { label: "Missing Valuation", value: data.missingValuation, color: "var(--gold)" },
          { label: "UOM Conflicts", value: data.uomConflicts, color: "var(--danger)" },
          { label: "Obsolete Items", value: data.obsoleteItems, color: "var(--slate)" },
          { label: "Dead Stock", value: data.deadStock, color: "var(--slate)" },
          { label: "Open Findings", value: data.openFindings, color: "var(--gold)" },
          { label: "CAPA Pending", value: data.capaPending, color: "var(--danger)" },
          { label: "Risk Score", value: `${riskScore}/100`, color: riskScore > 60 ? "var(--danger)" : riskScore > 30 ? "var(--gold)" : "var(--success)" },
          { label: "Data Completeness", value: `${completeness}%`, color: "var(--navy)", bar: completeness },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600, marginBottom: 4 }}>{kpi.label}</div>
            <h2 style={{ margin: 0, color: kpi.color }}>{kpi.value}</h2>
            {"bar" in kpi && (
              <div style={{ marginTop: 8, height: 4, background: "var(--line-soft)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${kpi.bar}%`, height: "100%", background: "var(--success)", borderRadius: 2 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ color: "var(--navy)", margin: "0 0 14px" }}>Category Distribution</h4>
          {catDistribution.map((c) => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 100, fontSize: 13, color: "var(--slate)" }}>{c.label}</span>
              <div style={{ flex: 1, height: 20, background: "var(--line-soft)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(c.value / maxCat) * 100}%`, height: "100%", background: "var(--navy)", borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, width: 50, textAlign: "right" }}>{c.value}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ color: "var(--navy)", margin: "0 0 14px" }}>Monthly Item Creation (2026)</h4>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
            {monthlyItems.map((m) => (
              <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", height: `${(m.value / maxMonthly) * 100}%`, background: "var(--gold)", borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                <span style={{ fontSize: 10, color: "var(--slate)", marginTop: 4 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ color: "var(--navy)", margin: "0 0 14px" }}>Risk Distribution</h4>
          {riskDist.map((r) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 60, fontSize: 13, color: "var(--slate)" }}>{r.label}</span>
              <div style={{ flex: 1, height: 20, background: "var(--line-soft)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(r.value / maxRisk) * 100}%`, height: "100%", background: r.color, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, width: 30, textAlign: "right" }}>{r.value}%</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ color: "var(--navy)", margin: "0 0 14px" }}>Duplicate Trend (Monthly)</h4>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, paddingTop: 10 }}>
            {dupTrend.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ width: "100%", height: `${(v / Math.max(...dupTrend)) * 100}%`, background: "var(--danger)", borderRadius: "2px 2px 0 0", minHeight: 4 }} />
                <span style={{ fontSize: 9, color: "var(--slate)", marginTop: 2 }}>
                  {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h4 style={{ color: "var(--navy)", margin: "0 0 12px" }}>Recent Exceptions</h4>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Code</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data.exceptions.map((ex) => (
              <tr key={ex.id}>
                <td>{ex.id}</td>
                <td><strong>{ex.itemCode}</strong></td>
                <td>{ex.type}</td>
                <td><span className={`badge ${ex.severity === "High" ? "badge-danger" : "badge-gold"}`}>{ex.severity}</span></td>
                <td>{ex.description}</td>
                <td><span className="badge badge-slate">{ex.status}</span></td>
                <td>{ex.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h4 style={{ color: "var(--navy)", margin: "0 0 12px" }}>Recent Findings</h4>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Code</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Status</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {data.findings.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td><strong>{f.itemCode}</strong></td>
                <td>{f.type}</td>
                <td><span className={`badge ${f.severity === "Critical" ? "badge-danger" : "badge-gold"}`}>{f.severity}</span></td>
                <td>{f.description}</td>
                <td><span className="badge badge-slate">{f.status}</span></td>
                <td>{f.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
