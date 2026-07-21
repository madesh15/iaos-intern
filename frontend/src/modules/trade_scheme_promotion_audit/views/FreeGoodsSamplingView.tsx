import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Spend {
  id: number;
  promo_name: string;
  channel: string;
  free_goods_qty: number;
  free_goods_reconciled: boolean;
  notes: string;
}

export default function FreeGoodsSamplingView() {
  const [items, setItems] = useState<Spend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Spend[]>(`/api/modules/${SLUG}/spend`);
        setItems(data.filter((s) => s.free_goods_qty > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalFreeGoods = items.reduce((s, i) => s + i.free_goods_qty, 0);
  const reconciled = items.filter((i) => i.free_goods_reconciled).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Free-Goods & Sampling Reconciliation</h3>
        <p style={{ color: "var(--slate)" }}>
          Tracks free-issue quantities against reconciliation status to ensure physical stock matches promotional commitments.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Free-Goods Qty</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{totalFreeGoods.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Reconciled Records</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{reconciled} / {items.length}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Pending Reconciliation</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{items.length - reconciled}</div>
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
                <th>Free-Goods Qty</th>
                <th>Reconciled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.promo_name}</strong></td>
                  <td>{s.channel}</td>
                  <td>{s.free_goods_qty.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${s.free_goods_reconciled ? "badge-success" : "badge-danger"}`}>
                      {s.free_goods_reconciled ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.free_goods_reconciled ? "badge-success" : "badge-gold"}`}>
                      {s.free_goods_reconciled ? "Reconciled" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No free-goods or sampling records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
