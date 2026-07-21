import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Scheme {
  id: number;
  scheme_code: string;
  scheme_name: string;
  scheme_type: string;
  channel: string;
  overlap_flag: boolean;
  overlap_schemes: string;
  budget_allocated: number;
}

export default function SchemeOverlapDetectionView() {
  const [items, setItems] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await get<Scheme[]>(`/api/modules/${SLUG}/schemes`);
        setItems(data.filter((s) => s.overlap_flag));
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
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Scheme-Overlap Detection</h3>
        <p style={{ color: "var(--slate)" }}>
          Identifies schemes with overlapping validity periods that may result in double-benefit conflicts for distributors or channels.
        </p>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--danger-tint)", color: "var(--danger)", padding: 12, borderRadius: "50%" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{items.length}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Overlapping Schemes Detected</div>
            <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>These schemes have concurrent validity and may cause double-benefit payouts</div>
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
                <th>Scheme Code</th>
                <th>Scheme Name</th>
                <th>Type</th>
                <th>Channel</th>
                <th>Budget</th>
                <th>Overlapping With</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.scheme_code}</strong></td>
                  <td>{s.scheme_name}</td>
                  <td>{s.scheme_type}</td>
                  <td>{s.channel}</td>
                  <td>{s.budget_allocated.toLocaleString()}</td>
                  <td>
                    <span className="badge badge-danger">
                      {s.overlap_schemes || "Multiple"}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No scheme overlaps detected.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
