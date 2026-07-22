import { useState, ReactNode } from "react";

interface Field {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  min?: number;
  step?: number;
}

interface FormBuilderProps {
  fields: Field[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
  loading?: boolean;
  columns?: 1 | 2 | 3;
}

export function FormBuilder({
  fields, values, onChange, onSubmit, onCancel,
  title, submitLabel = "Save", loading, columns = 2,
}: FormBuilderProps) {
  function setValue(name: string, value: any) {
    onChange({ ...values, [name]: value });
  }

  return (
    <div className="card" style={{ padding: 22, marginBottom: 16 }}>
      {title && <h3 style={{ marginBottom: 14 }}>{title}</h3>}
      <form onSubmit={onSubmit}>
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 12, marginBottom: 16,
        }}>
          {fields.map((f) => (
            <div className="field" key={f.name} style={f.type === "textarea" ? { gridColumn: "1 / -1" } : {}}>
              <label>{f.label}{f.required && " *"}</label>
              {f.type === "select" ? (
                <select className="input" required={f.required}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValue(f.name, e.target.value)}>
                  <option value="">Select...</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea className="input" rows={3} required={f.required}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValue(f.name, e.target.value)} />
              ) : (
                <input className="input" type={f.type || "text"} required={f.required}
                  placeholder={f.placeholder}
                  min={f.min} step={f.step}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValue(f.name, e.target.type === "number" ? Number(e.target.value) : e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : submitLabel}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)",
    }} onClick={onCancel}>
      <div className="card" style={{ maxWidth: 420, width: "90%", padding: 24 }}
        onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 8, color: "var(--danger)" }}>{title}</h3>
        <p style={{ color: "var(--slate)", marginBottom: 20, fontSize: 14 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>
      <div style={{ fontSize: 14 }}>{message}</div>
    </div>
  );
}

export function EmptyState({ message = "No records found.", children }: { message?: string; children?: ReactNode }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
      <p style={{ fontSize: 14 }}>{message}</p>
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Active: "#059669", Delivered: "#059669", Approved: "#059669", Paid: "#059669", Generated: "#059669",
    "In Transit": "#2563eb", Pending: "#ca8a04", Open: "#ca8a04", "In Progress": "#2563eb", Draft: "#6b7280",
    Delayed: "#ea580c", Rejected: "#dc2626", Expired: "#dc2626", Cancelled: "#6b7280", Closed: "#6b7280",
    High: "#dc2626", Medium: "#ca8a04", Low: "#059669", Critical: "#7c1139",
  };
  const color = colorMap[status] || "var(--slate)";
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      fontSize: 11, fontWeight: 600, background: `${color}15`, color,
    }}>
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const s = severity?.toLowerCase() || "";
  const color = s === "high" || s === "critical" ? "#dc2626" : s === "medium" ? "#ca8a04" : "#059669";
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      fontSize: 11, fontWeight: 600, background: `${color}15`, color,
    }}>
      {severity}
    </span>
  );
}
