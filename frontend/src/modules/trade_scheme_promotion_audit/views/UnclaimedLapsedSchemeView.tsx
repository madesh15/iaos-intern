import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Outlet {
  id: number;
  outlet_name: string;
  outlet_code: string;
  channel: string;
  distributor: string;
  unclaimed_amount: number;
  unclaimed_scheme_codes: string;
  notes: string;
}

export default function UnclaimedLapsedSchemeView() {
  const [items, setItems] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Outlet[]>(`/api/modules/${SLUG}/outlets`);
        setItems(data.filter((o) => o.unclaimed_amount > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalUnclaimed = items.reduce((s, i) => s + i.unclaimed_amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Unclaimed / Lapsed Scheme</h3>
        <p style={{ color: "var(--slate)" }}>
          Identifies expired schemes with unclaimed benefits — a source of trade-spend leakage where payouts remain unrecovered.
        </p>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--gold-tint)", color: "var(--gold-strong)", padding: 12, borderRadius: "50%" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{totalUnclaimed.toLocaleString()}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Unclaimed Amount</div>
            <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>Across {items.length} outlets with unrecovered scheme benefits</div>
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
                <th>Outlet</th>
                <th>Channel</th>
                <th>Distributor</th>
                <th>Unclaimed Amount</th>
                <th>Scheme Codes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.outlet_code}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>{o.outlet_name}</div>
                  </td>
                  <td>{o.channel}</td>
                  <td>{o.distributor}</td>
                  <td><span className="badge badge-gold">{o.unclaimed_amount.toLocaleString()}</span></td>
                  <td style={{ fontSize: 12, color: "var(--slate)" }}>{o.unclaimed_scheme_codes || "—"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No unclaimed/lapsed schemes found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
