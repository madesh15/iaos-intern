import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Claim {
  id: number;
  claim_id: string;
  distributor_name: string;
  scheme_code: string;
  channel: string;
  claim_amount: number;
  settled_amount: number;
  proof_of_performance: boolean;
  validation_status: string;
  settlement_status: string;
  duplicate_flag: boolean;
  duplicate_claim_refs: string;
  inflation_flag: boolean;
  ageing_days: number;
  claim_date: string | null;
  notes: string;
}

export default function DuplicateInflatedClaimsView() {
  const [items, setItems] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Claim[]>(`/api/modules/${SLUG}/claims`);
        setItems(data.filter((c) => c.duplicate_flag || c.inflation_flag));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalAtRisk = items.reduce((sum, c) => sum + c.claim_amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Duplicate / Inflated Claims</h3>
        <p style={{ color: "var(--slate)" }}>
          Identifies claims flagged as duplicates or with inflated amounts — a key trade-spend leakage vector.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--danger-tint)", color: "var(--danger)", padding: 12, borderRadius: "50%" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{items.length}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Flagged Claims</div>
            <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>Duplicate or inflated amount detected</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--gold-tint)", color: "var(--gold-strong)", padding: 12, borderRadius: "50%" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{totalAtRisk.toLocaleString()}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Amount at Risk</div>
            <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>Claim value pending review</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading flagged claims...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Distributor</th>
                <th>Scheme</th>
                <th>Claim Amount</th>
                <th>Flags</th>
                <th>Ref Claims</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.claim_id}</strong></td>
                  <td>{c.distributor_name}</td>
                  <td>{c.scheme_code}</td>
                  <td>{c.claim_amount.toLocaleString()}</td>
                  <td>
                    {c.duplicate_flag && <span className="badge badge-danger" style={{ marginRight: 4 }}>Duplicate</span>}
                    {c.inflation_flag && <span className="badge badge-gold">Inflated</span>}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--slate)" }}>{c.duplicate_claim_refs || "—"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No duplicate or inflated claims detected.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
