import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Spend {
  id: number;
  promo_name: string;
  channel: string;
  slab_tier: string;
  target_quantity: number;
  achieved_quantity: number;
  slab_qualified: boolean;
}

export default function SlabTargetAchievementView() {
  const [items, setItems] = useState<Spend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Spend[]>(`/api/modules/${SLUG}/spend`);
        setItems(data.filter((s) => s.slab_tier !== ""));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Slab / Target Achievement</h3>
        <p style={{ color: "var(--slate)" }}>
          Validates correct-slab payout by verifying target vs achieved quantities against slab tiers.
        </p>
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
                <th>Slab Tier</th>
                <th>Target Qty</th>
                <th>Achieved Qty</th>
                <th>Achievement %</th>
                <th>Qualified</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => {
                const pct = s.target_quantity > 0 ? (s.achieved_quantity / s.target_quantity) * 100 : 0;
                return (
                  <tr key={s.id}>
                    <td><strong>{s.promo_name}</strong></td>
                    <td>{s.channel}</td>
                    <td><span className="badge badge-slate">{s.slab_tier}</span></td>
                    <td>{s.target_quantity.toLocaleString()}</td>
                    <td>{s.achieved_quantity.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${pct >= 100 ? "badge-success" : pct >= 75 ? "badge-gold" : "badge-danger"}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.slab_qualified ? "badge-success" : "badge-danger"}`}>
                        {s.slab_qualified ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No slab-based promotions found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
