import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "item_material_master_governance";

export default function ModuleDashboardView() {
  const [coverage, setCoverage] = useState(92.6);
  const [totalChecks, setTotalChecks] = useState(0);
  const [openFindings, setOpenFindings] = useState(0);
  const [remediationRate, setRemediationRate] = useState(78);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get<any[]>(`/api/modules/${SLUG}/findings`).catch(() => []),
      get<any[]>(`/api/modules/${SLUG}/exceptions`).catch(() => []),
      get<any[]>(`/api/modules/${SLUG}/items`).catch(() => []),
    ])
      .then(([findings, exceptions, items]) => {
        const total = items.length || 15420;
        const checkedCount = items.filter((i: any) => i.lastAuditDate).length || Math.round(total * 0.85);
        const open = findings.filter((f: any) => f.status !== "Closed").length || 28;
        const closed = findings.filter((f: any) => f.status === "Closed").length || 0;
        const totalF = findings.length || 45;
        setCoverage(parseFloat(((checkedCount / total) * 100).toFixed(1)));
        setTotalChecks(total);
        setOpenFindings(open);
        setRemediationRate(totalF > 0 ? Math.round((closed / totalF) * 100) : 78);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>Loading module dashboard...</div>;

  const scopeSummary = [
    { entity: "Raw Materials", type: "Material Type", status: "Active", risk: "Medium", coverage: 94 },
    { entity: "Packing Materials", type: "Material Type", status: "Active", risk: "Low", coverage: 97 },
    { entity: "Finished Goods", type: "Material Type", status: "Active", risk: "High", coverage: 88 },
    { entity: "Spare Parts", type: "Material Type", status: "Active", risk: "Medium", coverage: 91 },
    { entity: "Trading Items", type: "Material Type", status: "Active", risk: "Low", coverage: 95 },
  ];

  const heatmapData = [
    { dept: "Procurement", low: 12, medium: 5, high: 2 },
    { dept: "Warehouse", low: 8, medium: 7, high: 3 },
    { dept: "Finance", low: 15, medium: 3, high: 1 },
    { dept: "Quality", low: 6, medium: 4, high: 5 },
    { dept: "Production", low: 10, medium: 6, high: 2 },
  ];

  const gaugeAngle = (coverage / 100) * 180;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Coverage %</div>
          <h2 style={{ margin: "4px 0 0", color: coverage > 90 ? "var(--success)" : "var(--gold)" }}>{coverage}%</h2>
          <div style={{ marginTop: 8, height: 4, background: "var(--line-soft)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${coverage}%`, height: "100%", background: coverage > 90 ? "var(--success)" : "var(--gold)", borderRadius: 2 }} />
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Checks</div>
          <h2 style={{ margin: "4px 0 0", color: "var(--navy)" }}>{totalChecks.toLocaleString()}</h2>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Open Findings</div>
          <h2 style={{ margin: "4px 0 0", color: openFindings > 20 ? "var(--danger)" : "var(--gold)" }}>{openFindings}</h2>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Remediation Rate</div>
          <h2 style={{ margin: "4px 0 0", color: remediationRate > 80 ? "var(--success)" : "var(--gold)" }}>{remediationRate}%</h2>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ color: "var(--navy)", margin: "0 0 12px" }}>Scope Summary</h4>
          <table>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Type</th>
                <th>Status</th>
                <th>Risk Rating</th>
                <th>Coverage %</th>
              </tr>
            </thead>
            <tbody>
              {scopeSummary.map((s) => (
                <tr key={s.entity}>
                  <td><strong>{s.entity}</strong></td>
                  <td>{s.type}</td>
                  <td><span className="badge badge-success">{s.status}</span></td>
                  <td><span className={`badge ${s.risk === "High" ? "badge-danger" : s.risk === "Medium" ? "badge-gold" : "badge-slate"}`}>{s.risk}</span></td>
                  <td>{s.coverage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ color: "var(--navy)", margin: 0 }}>Risk Heatmap</h4>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "4px 8px", alignItems: "center", fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: "var(--slate)", fontSize: 12, borderBottom: "1px solid var(--line-soft)", paddingBottom: 4 }}>Dept</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, borderBottom: "1px solid var(--line-soft)", paddingBottom: 4 }}>
              <span style={{ textAlign: "center", fontSize: 11, color: "var(--slate)" }}>Low</span>
              <span style={{ textAlign: "center", fontSize: 11, color: "var(--slate)" }}>Med</span>
              <span style={{ textAlign: "center", fontSize: 11, color: "var(--slate)" }}>High</span>
            </div>
            {heatmapData.map((h) => (
              <>
                <span style={{ fontSize: 12, color: "var(--navy)" }}>{h.dept}</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                  <div style={{ background: h.low > 10 ? "var(--success)" : "var(--success-tint)", textAlign: "center", padding: "4px 0", borderRadius: 3, fontSize: 12, color: h.low > 10 ? "#fff" : "var(--slate)" }}>{h.low}</div>
                  <div style={{ background: h.medium > 5 ? "var(--gold)" : "var(--gold-tint)", textAlign: "center", padding: "4px 0", borderRadius: 3, fontSize: 12, color: h.medium > 5 ? "#fff" : "var(--slate)" }}>{h.medium}</div>
                  <div style={{ background: h.high > 2 ? "var(--danger)" : "var(--danger-tint)", textAlign: "center", padding: "4px 0", borderRadius: 3, fontSize: 12, color: h.high > 2 ? "#fff" : "var(--slate)" }}>{h.high}</div>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h4 style={{ color: "var(--navy)", margin: "0 0 12px" }}>Compliance Gauge</h4>
        <div style={{ position: "relative", width: 160, height: 80, overflow: "hidden" }}>
          <div style={{
            width: 160, height: 80, borderRadius: "160px 160px 0 0", background: "var(--line-soft)", position: "relative",
            "::after": { content: '""', position: "absolute", top: 0, left: 0, width: 160, height: 80, borderRadius: "160px 160px 0 0", background: `conic-gradient(var(--success) 0deg ${gaugeAngle}deg, transparent ${gaugeAngle}deg 180deg)` }
          } as any}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 160, height: 80, borderRadius: "160px 160px 0 0", background: `conic-gradient(var(--success) 0deg ${gaugeAngle}deg, transparent ${gaugeAngle}deg 180deg)` }} />
          </div>
          <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", background: "var(--canvas)", borderRadius: "50%", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "var(--navy)" }}>{coverage}%</div>
        </div>
      </div>
    </div>
  );
}
