import { ReactNode } from "react";
import { StatusBadge } from "./Forms";
import { exportCSV, exportXLSX } from "./api";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  page?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: (row: T) => ReactNode;
  exportEntity?: string;
  title?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, loading, emptyMessage = "No records found.",
  page, total, pageSize = 20, onPageChange,
  onSearch, searchValue, searchPlaceholder = "Search...",
  filters, actions, exportEntity, title, onAdd, addLabel,
}: DataTableProps<T>) {
  const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        {title && <h2 style={{ margin: 0 }}>{title}</h2>}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {onAdd && <button className="btn btn-primary" onClick={onAdd}>+ {addLabel || "New"}</button>}
          {exportEntity && (
            <>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportCSV(exportEntity)}>
                CSV
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportXLSX(exportEntity)}>
                Excel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {(onSearch || filters) && (
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid var(--border)",
            display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
          }}>
            {onSearch && (
              <input className="input" placeholder={searchPlaceholder} value={searchValue || ""}
                onChange={(e) => onSearch(e.target.value)} style={{ maxWidth: 280 }} />
            )}
            {filters}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>
            <div style={{ fontSize: 14 }}>Loading...</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} style={col.width ? { width: col.width } : undefined}>{col.label}</th>
                  ))}
                  {actions && <th style={{ width: 100 }}></th>}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)}
                      style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={row.id ?? i}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                        </td>
                      ))}
                      {actions && <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{actions(row)}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {onPageChange && total !== undefined && (
          <div style={{
            padding: "8px 16px", borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center",
          }}>
            <span style={{ color: "var(--slate)" }}>{total} total</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}
                disabled={!page || page <= 1}
                onClick={() => onPageChange((page || 1) - 1)}>Prev</button>
              <span style={{ padding: "4px 0", color: "var(--slate)" }}>
                {page || 1} / {totalPages}
              </span>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}
                disabled={!page || page >= totalPages}
                onClick={() => onPageChange((page || 1) + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function statusRenderer(status: string) {
  return <StatusBadge status={status} />;
}

export function currencyRenderer(value: number) {
  if (value == null) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}

export function weightRenderer(kg: number) {
  if (!kg) return "—";
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}T`;
  return `${kg}kg`;
}

export function dateRenderer(date: string | null) {
  if (!date) return "—";
  return date;
}
