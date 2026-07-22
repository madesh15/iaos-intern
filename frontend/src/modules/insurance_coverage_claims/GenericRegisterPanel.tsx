import { useEffect, useState } from "react";
import { del, get, patch, post } from "../../lib/api";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

export interface ColumnDef {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  title: string;
  endpoint: string; // e.g. /api/modules/insurance_coverage_claims/exclusions
  fields: FieldDef[]; // drives the "add" form
  columns: ColumnDef[]; // drives the table
  fixedFields?: Record<string, unknown>; // merged into every create payload (e.g. page_type)
  listParams?: Record<string, string>; // merged into every list query (e.g. page_type filter)
  statusField?: string; // if set, renders an inline-editable status <select> in its own column
  statusOptions?: string[];
  searchPlaceholder?: string;
}

function defaultValue(f: FieldDef) {
  if (f.type === "number") return 0;
  if (f.type === "select") return f.options?.[0] ?? "";
  return "";
}

export default function GenericRegisterPanel({
  title,
  endpoint,
  fields,
  columns,
  fixedFields = {},
  listParams = {},
  statusField,
  statusOptions = [],
  searchPlaceholder = "Search…",
}: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => (init[f.key] = defaultValue(f)));
    return init;
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ ...listParams });
      if (search) qs.set("search", search);
      const res = await get<{ total: number; items: Record<string, unknown>[] }>(
        `${endpoint}?${qs.toString()}`
      );
      setRows(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, endpoint]);

  async function addRow(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await post(endpoint, { ...form, ...fixedFields });
      const reset: Record<string, unknown> = {};
      fields.forEach((f) => (reset[f.key] = defaultValue(f)));
      setForm(reset);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  }

  async function removeRow(id: number) {
    await del(`${endpoint}/${id}`);
    load();
  }

  async function updateStatus(id: number, value: string) {
    if (!statusField) return;
    await patch(`${endpoint}/${id}`, { [statusField]: value });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.7fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ display: "flex", gap: 10, padding: 16 }}>
          <input
            className="input"
            placeholder={searchPlaceholder}
            style={{ flex: 1 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {error && (
          <div className="alert alert-danger" style={{ margin: "0 16px 12px" }}>
            {error}
          </div>
        )}
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              {statusField && <th>Status</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(r) : String(r[c.key] ?? "—")}</td>
                ))}
                {statusField && (
                  <td>
                    <select
                      className="select"
                      value={String(r[statusField] ?? "")}
                      onChange={(e) => updateStatus(Number(r.id), e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "6px 12px" }}
                    onClick={() => removeRow(Number(r.id))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (statusField ? 2 : 1)} style={{ color: "var(--slate)" }}>
                  No records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: 12, fontSize: 12, color: "var(--slate)" }}>{total} record(s)</div>
      </div>

      <form className="card" style={{ padding: 22 }} onSubmit={addRow}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add — {title}</h3>
        {fields.map((f) => (
          <div className="field" key={f.key}>
            <label>{f.label}</label>
            {f.type === "select" ? (
              <select
                className="select"
                value={String(form[f.key] ?? "")}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                required={f.required}
              >
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                className="input"
                rows={3}
                value={String(form[f.key] ?? "")}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            ) : (
              <input
                className="input"
                type={f.type}
                value={form[f.key] as string | number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                  })
                }
                required={f.required}
              />
            )}
          </div>
        ))}
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}
