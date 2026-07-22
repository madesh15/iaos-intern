import { useEffect, useState } from "react";
import { del, get, patch, post } from "../../lib/api";

const SLUG = "itgc";

interface Procedure {
  code: number;
  name: string;
  description: string;
}

interface TestRecord {
  id: number;
  procedure_code: number;
  status: string;
  tester: string;
  period: string;
  risk_rating: string;
  observations: string;
  evidence_url: string;
  tested_on: string;
  conclusion: string;
}

interface ProcedureSummary {
  procedure_code: number;
  procedure_name: string;
  description: string;
  total: number;
  by_status: Record<string, number>;
  latest_risk: string;
}

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  needs_retest: "Needs Retest",
  exception: "Exception",
};

const RISK_LABELS: Record<string, string> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const STATUS_COLORS: Record<string, string> = {
  not_started: "badge-slate",
  in_progress: "badge-gold",
  completed: "badge-success",
  needs_retest: "badge-gold",
  exception: "badge-danger",
};

const RISK_COLORS: Record<string, string> = {
  none: "badge-slate",
  low: "badge-success",
  medium: "badge-gold",
  high: "badge-danger",
  critical: "badge-danger",
};

const EMPTY_FORM = {
  procedure_code: 1,
  status: "not_started",
  tester: "",
  period: "",
  risk_rating: "none",
  observations: "",
  evidence_url: "",
  tested_on: "",
  conclusion: "",
};

export default function ItgcPage() {
  const [summary, setSummary] = useState<ProcedureSummary[]>([]);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function refresh() {
    const [sum, allTests] = await Promise.all([
      get<ProcedureSummary[]>(`/api/modules/${SLUG}/summary`),
      get<TestRecord[]>(`/api/modules/${SLUG}/tests`),
    ]);
    setSummary(sum);
    setTests(allTests);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  function openCreate(code: number) {
    setForm({ ...EMPTY_FORM, procedure_code: code });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(t: TestRecord) {
    setForm({
      procedure_code: t.procedure_code,
      status: t.status,
      tester: t.tester,
      period: t.period,
      risk_rating: t.risk_rating,
      observations: t.observations,
      evidence_url: t.evidence_url,
      tested_on: t.tested_on,
      conclusion: t.conclusion,
    });
    setEditingId(t.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await patch(`/api/modules/${SLUG}/tests/${editingId}`, form);
    } else {
      await post(`/api/modules/${SLUG}/tests`, form);
    }
    setShowForm(false);
    setEditingId(null);
    refresh();
  }

  async function handleDelete(id: number) {
    await del(`/api/modules/${SLUG}/tests/${id}`);
    refresh();
  }

  const testsByProc = (code: number) =>
    tests.filter((t) => t.procedure_code === code);

  return (
    <div>
      <p style={{ color: "var(--slate)", marginBottom: 20 }}>
        15 Signature test procedures covering change management, logical
        access, privileged access, segregation of duties, backup and
        recovery, and more. Shell use-cases (dashboard, scope, RCM,
        sampling, findings, remediation) are served by the shared audit
        framework.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card" style={{ overflow: "hidden", marginBottom: 24 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Procedure</th>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Tests</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "center" }}>Risk</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => {
                const isOpen = expanded === s.procedure_code;
                const c = s.by_status["completed"] ?? 0;
                const ip = s.by_status["in_progress"] ?? 0;
                const ex = s.by_status["exception"] ?? 0;
                return (
                  <ProcedureRow
                    key={s.procedure_code}
                    s={s}
                    isOpen={isOpen}
                    c={c}
                    ip={ip}
                    ex={ex}
                    onToggle={() => setExpanded(isOpen ? null : s.procedure_code)}
                    onAdd={() => openCreate(s.procedure_code)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {expanded !== null && (
        <ExpandedDetail
          tests={testsByProc(expanded)}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <TestForm
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}
    </div>
  );
}

/* ── sub-components ─────────────────────────────────────────────── */

function ProcedureRow({
  s, isOpen, c, ip, ex, onToggle, onAdd,
}: {
  s: ProcedureSummary;
  isOpen: boolean;
  c: number;
  ip: number;
  ex: number;
  onToggle: () => void;
  onAdd: () => void;
}) {
  return (
    <tr style={{ cursor: "pointer" }} onClick={onToggle}>
      <td><strong>{s.procedure_code}</strong></td>
      <td><strong>{s.procedure_name}</strong></td>
      <td style={{ color: "var(--slate)" }}>{s.description}</td>
      <td style={{ textAlign: "center" }}>{s.total}</td>
      <td style={{ textAlign: "center" }}>
        {c > 0 && <span className="badge badge-success" style={{ marginRight: 4 }}>{c}</span>}
        {ip > 0 && <span className="badge badge-gold" style={{ marginRight: 4 }}>{ip}</span>}
        {ex > 0 && <span className="badge badge-danger">{ex}</span>}
        {s.total === 0 && <span className="badge badge-slate">0</span>}
      </td>
      <td style={{ textAlign: "center" }}>
        <span className={`badge ${RISK_COLORS[s.latest_risk] ?? "badge-slate"}`}>
          {RISK_LABELS[s.latest_risk] ?? s.latest_risk}
        </span>
      </td>
      <td style={{ textAlign: "right" }}>
        <button
          className="btn btn-ghost"
          style={{ padding: "4px 10px", fontSize: 13 }}
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
        >
          + Add Test
        </button>
      </td>
    </tr>
  );
}

function ExpandedDetail({
  tests, onEdit, onDelete,
}: {
  tests: TestRecord[];
  onEdit: (t: TestRecord) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="card" style={{ marginBottom: 24, padding: 20 }}>
      <h4 style={{ color: "var(--navy)", marginBottom: 12 }}>Test Records</h4>
      {tests.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No test records yet.</p>
      ) : (
        <table style={{ fontSize: 13 }}>
          <thead>
            <tr>
              <th>Period</th>
              <th>Tester</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Tested On</th>
              <th>Conclusion</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id}>
                <td>{t.period || "---"}</td>
                <td>{t.tester || "---"}</td>
                <td>
                  <span className={`badge ${STATUS_COLORS[t.status] ?? "badge-slate"}`}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${RISK_COLORS[t.risk_rating] ?? "badge-slate"}`}>
                    {RISK_LABELS[t.risk_rating] ?? t.risk_rating}
                  </span>
                </td>
                <td>{t.tested_on || "---"}</td>
                <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.conclusion || "---"}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={() => onEdit(t)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger, #e53e3e)" }}
                    onClick={() => onDelete(t.id)}
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TestForm({
  form, setForm, editingId, onSubmit, onCancel,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  editingId: number | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <form
        className="card"
        style={{ padding: 24, width: 520, maxHeight: "85vh", overflow: "auto" }}
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>
          {editingId ? "Edit Test Record" : `New Test Record — Procedure #${form.procedure_code}`}
        </h3>

        <div className="field">
          <label>Status</label>
          <select
            className="select"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Tester</label>
            <input
              className="input"
              value={form.tester}
              onChange={(e) => setForm({ ...form, tester: e.target.value })}
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Period</label>
            <input
              className="input"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              placeholder="e.g. Q3 2025"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Risk Rating</label>
            <select
              className="select"
              value={form.risk_rating}
              onChange={(e) => setForm({ ...form, risk_rating: e.target.value })}
            >
              {Object.entries(RISK_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Tested On</label>
            <input
              className="input"
              type="date"
              value={form.tested_on}
              onChange={(e) => setForm({ ...form, tested_on: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label>Evidence URL</label>
          <input
            className="input"
            value={form.evidence_url}
            onChange={(e) => setForm({ ...form, evidence_url: e.target.value })}
            placeholder="Link to evidence"
          />
        </div>

        <div className="field">
          <label>Observations</label>
          <textarea
            className="input"
            rows={3}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            placeholder="What was observed during testing"
          />
        </div>

        <div className="field">
          <label>Conclusion</label>
          <textarea
            className="input"
            rows={2}
            value={form.conclusion}
            onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
            placeholder="Overall conclusion"
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>
            {editingId ? "Update" : "Create"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
