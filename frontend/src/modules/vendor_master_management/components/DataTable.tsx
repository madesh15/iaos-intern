import React from "react";
import { usePagination, useSearch, useSort } from "../hooks/useData";

interface Column<T> {
  key: keyof T & string;
  label: string;
  render?: (val: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys,
  searchPlaceholder = "Search...",
  pageSize = 25,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const searched = useSearch(data, searchKeys || [], query);
  const { sorted, sortKey, sortDir, toggleSort } = useSort<T>(searched);
  const { page, setPage, totalPages, paginated, total } = usePagination(sorted, pageSize);

  return (
    <div>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
        <input
          className="input"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          style={{ flex: 1, maxWidth: 360 }}
        />
        <span style={{ color: "var(--slate)", fontSize: "0.85rem" }}>{total} records</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && toggleSort(col.key as keyof T)}
                  style={{ cursor: col.sortable !== false ? "pointer" : "default", userSelect: "none" }}
                >
                  {col.label}
                  {sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "2rem", color: "var(--slate)" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={(row as any).id ?? idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render((row as any)[col.key], row)
                        : (row as any)[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <button className="btn btn-ghost" onClick={() => setPage(page - 1)} disabled={page <= 1}>Prev</button>
          <span style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Page {page} of {totalPages}</span>
          <button className="btn btn-ghost" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}
