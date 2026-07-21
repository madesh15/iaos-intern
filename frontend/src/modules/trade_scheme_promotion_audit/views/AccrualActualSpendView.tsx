import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Spend {
  id: number;
  promo_name: string;
  channel: string;
  accrual_amount: number;
  actual_spend: number;
  variance: number;
  notes: string;
}

export default function AccrualActualSpendView() {
  const [items, setItems] = useState<Spend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Spend[]>(`/api/modules/${SLUG}/spend`);
        setItems(data.filter((s) => s.accrual_amount > 0 || s.actual_spend > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalAccrual = items.reduce((s, i) => s + i.accrual_amount, 0);
  const totalActual = items.reduce((s, i) => s + i.actual_spend, 0);
  const totalVariance = totalAccrual - totalActual;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Accrual vs Actual Spend</h3>
        <p style={{ color: "var(--slate)" }}>
          Compares trade-provision accruals booked in ERP against actual payouts to identify over/under-provisioning.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Accrual</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totalAccrual.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Actual Spend</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{totalActual.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Variance (Accrual - Actual)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: totalVariance > 0 ? "var(--danger)" : "var(--success)" }}>{totalVariance.toLocaleString()}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Promotion</th>
                <th>Channel</th>
                <th>Accrual</th>
                <th>Actual</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.promo_name}</strong></td>
                  <td>{s.channel}</td>
                  <td>{s.accrual_amount.toLocaleString()}</td>
                  <td>{s.actual_spend.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${s.variance > 0 ? "badge-danger" : s.variance < 0 ? "badge-success" : "badge-slate"}`}>
                      {s.variance > 0 ? "+" : ""}{s.variance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No accrual vs actual records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
