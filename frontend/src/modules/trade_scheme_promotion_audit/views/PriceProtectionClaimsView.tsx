import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Spend {
  id: number;
  promo_name: string;
  channel: string;
  price_protection_amount: number;
  price_protection_validated: boolean;
  notes: string;
}

export default function PriceProtectionClaimsView() {
  const [items, setItems] = useState<Spend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Spend[]>(`/api/modules/${SLUG}/spend`);
        setItems(data.filter((s) => s.price_protection_amount > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalAmount = items.reduce((s, i) => s + i.price_protection_amount, 0);
  const validated = items.filter((i) => i.price_protection_validated).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Price-Protection Claims</h3>
        <p style={{ color: "var(--slate)" }}>
          Validates stock-devaluation claims where distributors seek compensation for price drops during the holding period.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Claims Value</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totalAmount.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Validated</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{validated}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Pending Validation</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{items.length - validated}</div>
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
                <th>Protection Amount</th>
                <th>Validated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.promo_name}</strong></td>
                  <td>{s.channel}</td>
                  <td>{s.price_protection_amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${s.price_protection_validated ? "badge-success" : "badge-danger"}`}>
                      {s.price_protection_validated ? "Validated" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No price-protection claims found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
