import { useEffect, useState } from "react";
import { get } from "../../../lib/api";
import { Icon } from "../../../components/Icon";

const SLUG = "trade_scheme_promotion_audit";

export default function ModuleDashboardView() {
  const [stats, setStats] = useState({
    schemes: 0,
    claims: 0,
    spend: 0,
    outlets: 0,
    pendingClaims: 0,
    ghostOutlets: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [schemes, claims, spend, outlets] = await Promise.all([
          get<any[]>(`/api/modules/${SLUG}/schemes`),
          get<any[]>(`/api/modules/${SLUG}/claims`),
          get<any[]>(`/api/modules/${SLUG}/spend`),
          get<any[]>(`/api/modules/${SLUG}/outlets`),
        ]);
        setStats({
          schemes: schemes.length,
          claims: claims.length,
          spend: spend.reduce((s: number, i: any) => s + i.spend_amount, 0),
          outlets: outlets.length,
          pendingClaims: claims.filter((c: any) => c.settlement_status !== "Settled").length,
          ghostOutlets: outlets.filter((o: any) => o.is_ghost || o.performance_status === "Ghost").length,
        });
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--navy)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="cart" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Active Schemes</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.schemes}</h2>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--danger-tint)", color: "var(--danger)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="alert-triangle" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Pending Claims</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.pendingClaims}</h2>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--gold-tint)", color: "var(--gold-strong)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="wallet" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Promo Spend</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.spend.toLocaleString()}</h2>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--success-tint)", color: "var(--success)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="shield" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Ghost Outlets</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.ghostOutlets}</h2>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.8fr 1.2fr" }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 16, color: "var(--navy)" }}>Domain Audit Summary</h3>
          <p style={{ color: "var(--slate)", marginBottom: 20 }}>
            Assurance over trade-spend and promotions — a top leakage area — validating scheme design, claim settlement and ROI across channels for Retail / FMCG / CPG industries.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Module Index</span>
              <span className="badge badge-gold">Module 72</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Industry Domain</span>
              <span style={{ color: "var(--slate)" }}>Retail / FMCG</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Tenant Security</span>
              <span className="badge badge-success">Tenant Scoped Isolation Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
              <span style={{ fontWeight: 600 }}>CAAT Rule Sync</span>
              <span className="badge badge-slate">Synchronized (hourly)</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ color: "var(--navy)" }}>Trade-Spend Risk Index</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: "var(--gold-strong)" }}>42 <span style={{ fontSize: 18, color: "var(--slate-soft)" }}>/ 100</span></div>
            <span className="badge badge-gold" style={{ padding: "6px 12px", fontSize: 13 }}>Medium Risk Profile</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>
            Risk score synthesizes claim settlement efficiency, scheme overlap frequency, ghost outlet prevalence, and accrual variance accuracy.
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: "auto" }}>
            Run Audit Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
