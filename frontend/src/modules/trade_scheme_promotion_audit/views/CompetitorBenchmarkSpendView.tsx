import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Outlet {
  id: number;
  outlet_name: string;
  outlet_code: string;
  channel: string;
  competitor_spend_ratio: number;
  trade_spend_ratio: number;
  notes: string;
}

export default function CompetitorBenchmarkSpendView() {
  const [items, setItems] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Outlet[]>(`/api/modules/${SLUG}/outlets`);
        setItems(data.filter((o) => o.competitor_spend_ratio > 0 || o.trade_spend_ratio > 0));
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
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Competitor-Benchmark Spend</h3>
        <p style={{ color: "var(--slate)" }}>
          Compares company trade-spend ratios against industry averages and competitor benchmarks to assess spend efficiency.
        </p>
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
                <th>Competitor Spend Ratio</th>
                <th>Trade Spend Ratio</th>
                <th>Assessment</th>
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
                  <td>{o.competitor_spend_ratio.toFixed(1)}%</td>
                  <td>{o.trade_spend_ratio.toFixed(1)}%</td>
                  <td>
                    <span className={`badge ${o.trade_spend_ratio > o.competitor_spend_ratio ? "badge-success" : o.trade_spend_ratio < o.competitor_spend_ratio * 0.5 ? "badge-danger" : "badge-gold"}`}>
                      {o.trade_spend_ratio > o.competitor_spend_ratio ? "Above Benchmark" : o.trade_spend_ratio < o.competitor_spend_ratio * 0.5 ? "Below Benchmark" : "At Benchmark"}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No benchmark data available.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
