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
  settlement_status: string;
  ageing_days: number;
  claim_date: string | null;
}

export default function DistributorClaimAgeingView() {
  const [items, setItems] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Claim[]>(`/api/modules/${SLUG}/claims`);
        setItems(data.filter((c) => c.settlement_status !== "Settled").sort((a, b) => b.ageing_days - a.ageing_days));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function ageColor(days: number) {
    if (days >= 90) return "badge-danger";
    if (days >= 30) return "badge-gold";
    return "badge-success";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Distributor-Claim Ageing</h3>
        <p style={{ color: "var(--slate)" }}>
          Monitors pending trade claims by ageing buckets to identify overdue settlements and potential leakage.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Distributor</th>
                <th>Scheme</th>
                <th>Amount</th>
                <th>Ageing (Days)</th>
                <th>Status</th>
                <th>Claim Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.claim_id}</strong></td>
                  <td>{c.distributor_name}</td>
                  <td>{c.scheme_code}</td>
                  <td>{c.claim_amount.toLocaleString()}</td>
                  <td><span className={`badge ${ageColor(c.ageing_days)}`}>{c.ageing_days} days</span></td>
                  <td><span className="badge badge-gold">{c.settlement_status}</span></td>
                  <td>{c.claim_date || "—"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No pending claims found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
