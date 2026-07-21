import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Spend {
  id: number;
  promo_name: string;
  channel: string;
  display_spend: number;
  display_verified: boolean;
  notes: string;
}

export default function DisplayVisibilitySpendView() {
  const [items, setItems] = useState<Spend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Spend[]>(`/api/modules/${SLUG}/spend`);
        setItems(data.filter((s) => s.display_spend > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalDisplaySpend = items.reduce((s, i) => s + i.display_spend, 0);
  const verified = items.filter((i) => i.display_verified).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Display / Visibility Spend Validation</h3>
        <p style={{ color: "var(--slate)" }}>
          Validates merchandising-cost spend against physical display verification to prevent fictitious visibility claims.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Display Spend</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totalDisplaySpend.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Verified Displays</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{verified} / {items.length}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Pending Verification</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{items.length - verified}</div>
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
                <th>Display Spend</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.promo_name}</strong></td>
                  <td>{s.channel}</td>
                  <td>{s.display_spend.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${s.display_verified ? "badge-success" : "badge-danger"}`}>
                      {s.display_verified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No display/visibility spend records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
