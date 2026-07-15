import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "master_data_change_governance";

interface ChangeLog {
  id: number;
  master_type: string;
  record_id: string;
  record_name: string;
  field_name: string;
  old_value: string;
  new_value: string;
  change_type: string;
  change_user: string;
  change_timestamp: string;
  approval_status: string;
  notes: string;
}

const MASTER_TYPES = ["chart_of_accounts", "cost_centre", "bank_master", "gl_account", "profit_centre"];
const CHANGE_TYPES = ["create", "update", "delete"];

type SubTab = "critical_field" | "coa" | "cost_centre" | "bank";

export default function ChangeLogTab({ subTab }: { subTab: SubTab }) {
  const [items, setItems] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    master_type: "chart_of_accounts",
    record_id: "",
    record_name: "",
    field_name: "",
    old_value: "",
    new_value: "",
    change_type: "update",
    change_user: "",
    notes: "",
  });

  const endpoint = subTab === "coa" ? "chart-of-accounts"
    : subTab === "cost_centre" ? "cost-centres"
    : subTab === "bank" ? "bank-masters"
    : "change-logs";

  async function refresh() {
    setLoading(true);
    setItems(await get<ChangeLog[]>(`/api/modules/${SLUG}/${endpoint}`));
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [subTab]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.record_id.trim() || !form.field_name.trim()) return;
    await post(`/api/modules/${SLUG}/change-logs`, form);
    setForm({ ...form, record_id: "", record_name: "", field_name: "", old_value: "", new_value: "", notes: "" });
    setShowForm(false);
    refresh();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/change-logs/${id}`);
    refresh();
  }

  function statusBadge(status: string) {
    if (status === "auto_approved") return "badge-success";
    if (status === "pending") return "badge-gold";
    return "badge-danger";
  }

  const title = subTab === "coa" ? "Chart-of-Accounts Changes"
    : subTab === "cost_centre" ? "Cost-Centre / Profit-Centre Changes"
    : subTab === "bank" ? "Bank-Master Changes"
    : "Critical-Field Change Log";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "var(--navy)", margin: 0 }}>{title}</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Log Change"}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Master Type</label>
              <select className="select" value={form.master_type}
                onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
                {MASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Record ID</label>
              <input className="input" value={form.record_id}
                onChange={(e) => setForm({ ...form, record_id: e.target.value })} required />
            </div>
            <div className="field">
              <label>Record Name</label>
              <input className="input" value={form.record_name}
                onChange={(e) => setForm({ ...form, record_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Field Name</label>
              <input className="input" value={form.field_name}
                onChange={(e) => setForm({ ...form, field_name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Old Value</label>
              <input className="input" value={form.old_value}
                onChange={(e) => setForm({ ...form, old_value: e.target.value })} />
            </div>
            <div className="field">
              <label>New Value</label>
              <input className="input" value={form.new_value}
                onChange={(e) => setForm({ ...form, new_value: e.target.value })} />
            </div>
            <div className="field">
              <label>Change Type</label>
              <select className="select" value={form.change_type}
                onChange={(e) => setForm({ ...form, change_type: e.target.value })}>
                {CHANGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Changed By</label>
              <input className="input" value={form.change_user}
                onChange={(e) => setForm({ ...form, change_user: e.target.value })} />
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Notes</label>
            <input className="input" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }}>Save</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No change log entries yet.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Master</th>
                <th>Record</th>
                <th>Field</th>
                <th>Old → New</th>
                <th>User</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    {new Date(it.change_timestamp).toLocaleString()}
                  </td>
                  <td><span className="badge badge-slate">{it.master_type}</span></td>
                  <td>
                    <strong>{it.record_name || it.record_id}</strong>
                  </td>
                  <td>{it.field_name}</td>
                  <td style={{ fontSize: 12 }}>
                    <span style={{ color: "var(--slate)" }}>{it.old_value || "—"}</span>
                    {" → "}
                    <span style={{ color: "var(--navy)" }}>{it.new_value || "—"}</span>
                  </td>
                  <td>{it.change_user || "—"}</td>
                  <td><span className={`badge ${statusBadge(it.approval_status)}`}>{it.approval_status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                      onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
