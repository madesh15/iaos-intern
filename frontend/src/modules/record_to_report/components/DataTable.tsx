import React from "react";

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
  const searched = useSearchLocal(data, searchKeys || [], query);
  const { sorted, sortKey, sortDir, toggleSort } = useSortLocal<T>(searched);
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
        <input className="input" placeholder={searchPlaceholder} value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }} style={{ flex: 1, maxWidth: 360 }} />
        <span style={{ color: "var(--slate)", fontSize: "0.85rem" }}>{sorted.length} records</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => col.sortable !== false && toggleSort(col.key as keyof T)}
                  style={{ cursor: col.sortable !== false ? "pointer" : "default", userSelect: "none" }}>
                  {col.label}{sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: "2rem", color: "var(--slate)" }}>{emptyMessage}</td></tr>
            ) : paginated.map((row, idx) => (
              <tr key={(row as any).id ?? idx}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render((row as any)[col.key], row) : (row as any)[col.key] ?? "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <button className="btn btn-ghost" onClick={() => setPage(page - 1)} disabled={safePage <= 1}>Prev</button>
          <span style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Page {safePage} of {totalPages}</span>
          <button className="btn btn-ghost" onClick={() => setPage(page + 1)} disabled={safePage >= totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}

function useSearchLocal<T>(items: T[], keys: (keyof T)[], query: string): T[] {
  if (!query.trim()) return items;
  const lower = query.toLowerCase();
  return items.filter((item) => keys.some((k) => { const v = item[k]; return v != null && String(v).toLowerCase().includes(lower); }));
}

function useSortLocal<T>(items: T[]) {
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const toggleSort = (key: keyof T) => { if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } };
  const sorted = [...items].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey]; const bv = b[sortKey];
    if (av == null && bv == null) return 0; if (av == null) return 1; if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
  return { sorted, sortKey, sortDir, toggleSort };
}
