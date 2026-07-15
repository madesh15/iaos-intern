import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "master_data_change_governance";

interface Workflow {
  id: number; master_type: string; field_name: string;
  required_approvers: number; is_active: boolean; description: string;
}
interface BulkUpload {
  id: number; filename: string; master_type: string; uploaded_by: string;
  record_count: number; success_count: number; failure_count: number;
  status: string; notes: string;
}
interface FieldAccess {
  id: number; master_type: string; field_name: string;
  role: string; can_edit: boolean; can_view: boolean;
}

const MASTER_TYPES = ["chart_of_accounts", "cost_centre", "bank_master", "gl_account", "profit_centre"];
const ROLES = ["auditor", "tenant_admin", "super_admin"];

type SubTab = "maker_checker" | "after_hours" | "orphan" | "bulk_upload" | "field_access";

export default function GovernanceControlsTab({ subTab }: { subTab: SubTab }) {
  if (subTab === "maker_checker") return <MakerCheckerPanel />;
  if (subTab === "after_hours") return <AfterHoursPanel />;
  if (subTab === "orphan") return <OrphanPanel />;
  if (subTab === "bulk_upload") return <BulkUploadPanel />;
  return <FieldAccessPanel />;
}

/* ---------- 5. Maker-Checker Enforcement ---------- */
function MakerCheckerPanel() {
  const [items, setItems] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", field_name: "*", required_approvers: 1, description: "" });

  async function refresh() {
    setItems(await get<Workflow[]>(`/api/modules/${SLUG}/workflows`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/workflows`, form);
    setForm({ ...form, field_name: "*", description: "" });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Maker-Checker Enforcement</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label>Master Type</label>
            <select className="select" value={form.master_type}
              onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label>Field (* = all)</label>
            <input className="input" value={form.field_name}
              onChange={(e) => setForm({ ...form, field_name: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Required Approvers</label>
            <input className="input" type="number" min={1} max={10}
              value={form.required_approvers}
              onChange={(e) => setForm({ ...form, required_approvers: Number(e.target.value) })} />
          </div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}>
            <label>Description</label>
            <input className="input" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Workflow Rule</button>
      </form>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No workflow rules configured.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master Type</th><th>Field</th><th>Approvers</th><th>Active</th><th>Description</th><th></th></tr></thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td><span className="badge badge-slate">{w.master_type}</span></td>
                  <td>{w.field_name}</td>
                  <td>{w.required_approvers}</td>
                  <td><span className={`badge ${w.is_active ? "badge-success" : "badge-danger"}`}>{w.is_active ? "Yes" : "No"}</span></td>
                  <td style={{ color: "var(--slate)" }}>{w.description || "—"}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/workflows/${w.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 6. After-Hours Master Changes ---------- */
function AfterHoursPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setItems(await get<any[]>(`/api/modules/${SLUG}/after-hours-changes`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>After-Hours Master Changes</h3>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>Changes made outside business hours (before 8 AM or after 6 PM).</p>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No after-hours changes detected.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Timestamp</th><th>Master</th><th>Record</th><th>Field</th><th>User</th><th>New Value</th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td style={{ fontSize: 12 }}>{new Date(it.change_timestamp).toLocaleString()}</td>
                  <td><span className="badge badge-gold">{it.master_type}</span></td>
                  <td><strong>{it.record_name || it.record_id}</strong></td>
                  <td>{it.field_name}</td>
                  <td>{it.change_user || "—"}</td>
                  <td>{it.new_value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 7. Orphan / Unmapped Records ---------- */
function OrphanPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setItems(await get<any[]>(`/api/modules/${SLUG}/orphan-records`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Orphan / Unmapped Records</h3>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>Master records created but never updated — potential orphans lacking linkages.</p>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No orphan records detected.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Record ID</th><th>Name</th><th>Created</th><th>User</th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><span className="badge badge-slate">{it.master_type}</span></td>
                  <td>{it.record_id}</td>
                  <td><strong>{it.record_name || "—"}</strong></td>
                  <td style={{ fontSize: 12 }}>{new Date(it.change_timestamp).toLocaleString()}</td>
                  <td>{it.change_user || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 8. Bulk-Upload Controls ---------- */
function BulkUploadPanel() {
  const [items, setItems] = useState<BulkUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ filename: "", master_type: "chart_of_accounts", uploaded_by: "", record_count: 0, success_count: 0, failure_count: 0, status: "completed", notes: "" });

  async function refresh() {
    setItems(await get<BulkUpload[]>(`/api/modules/${SLUG}/bulk-uploads`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.filename.trim()) return;
    await post(`/api/modules/${SLUG}/bulk-uploads`, form);
    setForm({ ...form, filename: "", record_count: 0, success_count: 0, failure_count: 0, notes: "" });
    refresh();
  }

  function statusBadge(s: string) {
    if (s === "completed") return "badge-success";
    if (s === "failed") return "badge-danger";
    return "badge-gold";
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Bulk-Upload Controls</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 2, minWidth: 200 }}>
            <label>Filename</label>
            <input className="input" value={form.filename}
              onChange={(e) => setForm({ ...form, filename: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Master Type</label>
            <select className="select" value={form.master_type}
              onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Uploaded By</label>
            <input className="input" value={form.uploaded_by}
              onChange={(e) => setForm({ ...form, uploaded_by: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}>
            <label>Total</label>
            <input className="input" type="number" value={form.record_count}
              onChange={(e) => setForm({ ...form, record_count: Number(e.target.value) })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}>
            <label>Success</label>
            <input className="input" type="number" value={form.success_count}
              onChange={(e) => setForm({ ...form, success_count: Number(e.target.value) })} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}>
            <label>Failed</label>
            <input className="input" type="number" value={form.failure_count}
              onChange={(e) => setForm({ ...form, failure_count: Number(e.target.value) })} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Log Upload</button>
      </form>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No bulk uploads logged.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Filename</th><th>Master</th><th>By</th><th>Total</th><th>OK</th><th>Fail</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.filename}</strong></td>
                  <td><span className="badge badge-slate">{u.master_type}</span></td>
                  <td>{u.uploaded_by || "—"}</td>
                  <td>{u.record_count}</td>
                  <td style={{ color: "var(--green, #16a34a)" }}>{u.success_count}</td>
                  <td style={{ color: "var(--red, #dc2626)" }}>{u.failure_count}</td>
                  <td><span className={`badge ${statusBadge(u.status)}`}>{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- 9. Field-Level Access Review ---------- */
function FieldAccessPanel() {
  const [items, setItems] = useState<FieldAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", field_name: "", role: "auditor", can_edit: false, can_view: true });

  async function refresh() {
    setItems(await get<FieldAccess[]>(`/api/modules/${SLUG}/field-access`));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.field_name.trim()) return;
    await post(`/api/modules/${SLUG}/field-access`, form);
    setForm({ ...form, field_name: "" });
    refresh();
  }

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 16 }}>Field-Level Access Review</h3>
      <form className="card" style={{ padding: 20, marginBottom: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Master Type</label>
            <select className="select" value={form.master_type}
              onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Field Name</label>
            <input className="input" value={form.field_name}
              onChange={(e) => setForm({ ...form, field_name: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}>
            <label>Role</label>
            <select className="select" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={form.can_edit}
                onChange={(e) => setForm({ ...form, can_edit: e.target.checked })} />
              Can Edit
            </label>
          </div>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={form.can_view}
                onChange={(e) => setForm({ ...form, can_view: e.target.checked })} />
              Can View
            </label>
          </div>
          <button className="btn btn-primary">Add</button>
        </div>
      </form>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No field access configs defined.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Field</th><th>Role</th><th>Edit</th><th>View</th><th></th></tr></thead>
            <tbody>
              {items.map((fa) => (
                <tr key={fa.id}>
                  <td><span className="badge badge-slate">{fa.master_type}</span></td>
                  <td>{fa.field_name}</td>
                  <td>{fa.role}</td>
                  <td><span className={`badge ${fa.can_edit ? "badge-success" : "badge-danger"}`}>{fa.can_edit ? "Yes" : "No"}</span></td>
                  <td><span className={`badge ${fa.can_view ? "badge-success" : "badge-danger"}`}>{fa.can_view ? "Yes" : "No"}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }}
                    onClick={async () => { await del(`/api/modules/${SLUG}/field-access/${fa.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
