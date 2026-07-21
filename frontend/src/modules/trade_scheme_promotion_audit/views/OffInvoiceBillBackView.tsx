import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Spend {
  id: number;
  promo_name: string;
  promo_type: string;
  channel: string;
  mechanism: string;
  spend_amount: number;
  actual_spend: number;
  notes: string;
}

export default function OffInvoiceBillBackView() {
  const [items, setItems] = useState<Spend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Spend[]>(`/api/modules/${SLUG}/spend`);
        setItems(data.filter((s) => s.mechanism === "Off-Invoice" || s.mechanism === "Bill-Back"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const offInvoice = items.filter((s) => s.mechanism === "Off-Invoice");
  const billBack = items.filter((s) => s.mechanism === "Bill-Back");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Off-Invoice vs Bill-Back Controls</h3>
        <p style={{ color: "var(--slate)" }}>
          Validates the discount mechanism controls — off-invoice deductions applied at billing vs bill-back claims settled post-delivery.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ color: "var(--navy)", marginBottom: 12 }}>Off-Invoice Deductions</h4>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{offInvoice.length}</div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Records with off-invoice mechanism</div>
          <div style={{ marginTop: 12, fontSize: 13, color: "var(--slate)" }}>
            Total value: <strong>{offInvoice.reduce((s, i) => s + i.spend_amount, 0).toLocaleString()}</strong>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ color: "var(--navy)", marginBottom: 12 }}>Bill-Back Claims</h4>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{billBack.length}</div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>Records with bill-back mechanism</div>
          <div style={{ marginTop: 12, fontSize: 13, color: "var(--slate)" }}>
            Total value: <strong>{billBack.reduce((s, i) => s + i.spend_amount, 0).toLocaleString()}</strong>
          </div>
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
                <th>Mechanism</th>
                <th>Channel</th>
                <th>Spend Amount</th>
                <th>Actual Spend</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.promo_name}</strong></td>
                  <td>
                    <span className={`badge ${s.mechanism === "Off-Invoice" ? "badge-gold" : "badge-slate"}`}>
                      {s.mechanism}
                    </span>
                  </td>
                  <td>{s.channel}</td>
                  <td>{s.spend_amount.toLocaleString()}</td>
                  <td>{s.actual_spend.toLocaleString()}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No off-invoice or bill-back records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
