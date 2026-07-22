import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "item_material_master_governance";

type ScopeEntity = {
  id: number;
  entity: string;
  type: string;
  status: string;
  riskRating: string;
  coverage: number;
};

export default function ScopeUniverseView() {
  const [entities, setEntities] = useState<ScopeEntity[]>([
    { id: 1, entity: "Plant - Pune", type: "Plant", status: "Active", riskRating: "Medium", coverage: 94 },
    { id: 2, entity: "Plant - Chennai", type: "Plant", status: "Active", riskRating: "High", coverage: 82 },
    { id: 3, entity: "Warehouse - Bhiwandi", type: "Warehouse", status: "Active", riskRating: "Low", coverage: 97 },
    { id: 4, entity: "Warehouse - Guwahati", type: "Warehouse", status: "Active", riskRating: "Medium", coverage: 91 },
    { id: 5, entity: "Business Unit - FMCG", type: "Business Unit", status: "Active", riskRating: "High", coverage: 78 },
    { id: 6, entity: "Business Unit - Pharma", type: "Business Unit", status: "Active", riskRating: "Medium", coverage: 88 },
    { id: 7, entity: "Plant - Hyderabad", type: "Plant", status: "Inactive", riskRating: "Low", coverage: 0 },
  ]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    get<any[]>(`/api/modules/${SLUG}/items`).then((items) => {
      if (items && items.length > 0) {
        const mapped: ScopeEntity[] = items.slice(0, 10).map((i: any, idx: number) => ({
          id: idx + 10,
          entity: i.itemCode || i.name || `Item-${idx}`,
          type: i.category || "Material",
          status: i.status || "Active",
          riskRating: i.riskRating || "Medium",
          coverage: i.coveragePct || Math.round(Math.random() * 30 + 70),
        }));
        setEntities((prev) => [...prev, ...mapped]);
      }
    }).catch(() => {});
  }, []);

  const filtered = entities.filter((e) => {
    const matchSearch = !search || e.entity.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || e.type === filterType;
    return matchSearch && matchType;
  });

  const cards = [
    { label: "Plants Covered", value: entities.filter((e) => e.type === "Plant").length },
    { label: "Warehouses", value: entities.filter((e) => e.type === "Warehouse").length },
    { label: "Business Units", value: entities.filter((e) => e.type === "Business Unit").length },
    { label: "Total Scope Items", value: entities.length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{c.label}</div>
            <h2 style={{ margin: "4px 0 0", color: "var(--navy)" }}>{c.value}</h2>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <input className="input" placeholder="Search entity..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
          <select className="select" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">All Types</option>
            <option value="Plant">Plant</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Business Unit">Business Unit</option>
            <option value="Material">Material</option>
          </select>
          <span style={{ color: "var(--slate)", fontSize: 13 }}>({filtered.length} results)</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--slate)" }}>No scope entities match your search.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Type</th>
                <th>Status</th>
                <th>Risk Rating</th>
                <th>Coverage %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.entity}</strong></td>
                  <td>{e.type}</td>
                  <td><span className={`badge ${e.status === "Active" ? "badge-success" : "badge-slate"}`}>{e.status}</span></td>
                  <td><span className={`badge ${e.riskRating === "High" ? "badge-danger" : e.riskRating === "Medium" ? "badge-gold" : "badge-slate"}`}>{e.riskRating}</span></td>
                  <td>{e.coverage > 0 ? `${e.coverage}%` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
