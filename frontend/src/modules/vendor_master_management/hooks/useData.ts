import { useState, useEffect, useCallback } from "react";

type Fetcher<T> = () => Promise<T>;

export function useFetch<T>(fetcher: Fetcher<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export function usePagination<T>(items: T[], pageSize: number = 25) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { page: safePage, setPage, totalPages, paginated, total: items.length };
}

export function useSearch<T>(items: T[], keys: (keyof T)[], query: string) {
  if (!query.trim()) return items;
  const lower = query.toLowerCase();
  return items.filter((item) =>
    keys.some((k) => {
      const val = item[k];
      return val !== null && val !== undefined && String(val).toLowerCase().includes(lower);
    })
  );
}

export function useSort<T>(items: T[], defaultKey?: keyof T, defaultDir: "asc" | "desc" = "asc") {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultDir);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...items].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  return { sorted, sortKey, sortDir, toggleSort };
}
