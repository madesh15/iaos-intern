import { useEffect, useState } from "react";
import { get } from "../../../lib/api";
import { Icon } from "../../../components/Icon";

export default function ModuleDashboardView() {
  const [stats, setStats] = useState({ escrows: 0, budgets: 0, collections: 0, diversions: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [esc, bud, col, div] = await Promise.all([
          get<any[]>("/api/modules/project_cost_rera/escrow"),
          get<any[]>("/api/modules/project_cost_rera/budgets"),
          get<any[]>("/api/modules/project_cost_rera/collections"),
          get<any[]>("/api/modules/project_cost_rera/diversions"),
        ]);
        setStats({
          escrows: esc.length,
          budgets: bud.length,
          collections: col.length,
          diversions: div.filter((d: any) => d.status !== "Cleared").length,
        });
      } catch {}
    }
    load();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--navy)", padding: 12, borderRadius: "50%", display: "flex" }}><Icon name="building" size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>RERA Escrow Accounts</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.escrows}</h2>
            <div style={{ fontSize: 12, color: "var(--success)" }}>Monitored</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--gold-tint)", color: "var(--gold-strong)", padding: 12, borderRadius: "50%", display: "flex" }}><Icon name="wallet" size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Cost Budgets Tracked</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.budgets}</h2>
            <div style={{ fontSize: 12, color: "var(--gold-strong)" }}>Active cost heads</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--slate)", padding: 12, borderRadius: "50%", display: "flex" }}><Icon name="trending-up" size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Buyer Collections</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.collections}</h2>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>Demand entries</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--danger-tint)", color: "var(--danger)", padding: 12, borderRadius: "50%", display: "flex" }}><Icon name="alert-triangle" size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Open Fund Diversions</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.diversions}</h2>
            <div style={{ fontSize: 12, color: "var(--danger)" }}>Pending clearance</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.8fr 1.2fr" }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 16, color: "var(--navy)" }}>Domain Audit Summary</h3>
          <p style={{ color: "var(--slate)", marginBottom: 20 }}>
            Audit assurance for real-estate projects covering RERA escrow discipline, project-cost control,
            revenue recognition (Ind AS 115), buyer-fund governance, and statutory approval compliance.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Module Index</span><span className="badge badge-gold">Module 77</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Domain Group</span><span style={{ color: "var(--slate)" }}>Industry Packs</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Industry</span><span style={{ color: "var(--slate)" }}>Real Estate & Construction</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
              <span style={{ fontWeight: 600 }}>Tenant Security</span><span className="badge badge-success">Tenant Scoped Isolation Active</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ color: "var(--navy)" }}>RERA Compliance Risk Index</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: "var(--gold-strong)" }}>42 <span style={{ fontSize: 18, color: "var(--slate-soft)" }}>/ 100</span></div>
            <span className="badge badge-gold" style={{ padding: "6px 12px", fontSize: 13 }}>Moderate Risk Profile</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>
            Risk score synthesizes escrow withdrawal compliance, fund diversion flags, budget variance, penalty accruals, and approval validity.
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: "auto" }}>Run Compliance Diagnostics</button>
        </div>
      </div>
    </div>
  );
}
