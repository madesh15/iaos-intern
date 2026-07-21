import { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";

const SLUG = "logistics_freight";

interface Invoice {
  id: number; invoice_number: string; shipment_id: number | null; carrier_id: number;
  invoice_date: string; due_date: string; billed_amount: number; approved_amount: number;
  difference_amount: number; total_amount: number; status: string; payment_status: string;
}

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 15;

  function load() {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/invoices?page=${page}&page_size=${pageSize}&search=${search}&status=${statusFilter}`)
      .then((res) => { setItems(res.items); setTotal(res.total); setLoading(false); });
  }

  useEffect(() => { load(); }, [page, search, statusFilter]);

  async function remove(id: number) {
    if (!confirm("Delete?")) return;
    await del(`/api/modules/${SLUG}/invoices/${id}`); load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Freight Invoices</h2>
        <a className="btn btn-primary" href={`/api/modules/${SLUG}/export/invoices/csv`}>Export CSV</a>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12 }}>
          <input className="input" placeholder="Search invoices..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 240 }} />
          <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        {loading ? <p style={{ padding: 18 }}>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Invoice#</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Billed</th>
                <th>Approved</th>
                <th>Difference</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.invoice_number}</strong></td>
                  <td>{i.invoice_date}</td>
                  <td>{i.due_date}</td>
                  <td>₹{i.billed_amount.toLocaleString()}</td>
                  <td>₹{i.approved_amount.toLocaleString()}</td>
                  <td style={{ color: i.difference_amount > 0 ? "var(--danger)" : "inherit" }}>
                    ₹{i.difference_amount.toLocaleString()}</td>
                  <td>₹{i.total_amount.toLocaleString()}</td>
                  <td><span className={`badge ${i.status === "Approved" ? "badge-success" : "badge"}`}>{i.status}</span></td>
                  <td><span className={`badge ${i.payment_status === "Paid" ? "badge-success" : "badge"}`}>{i.payment_status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => remove(i.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={10} style={{ color: "var(--slate)" }}>No invoices found.</td></tr>}
            </tbody>
          </table>
        )}
        <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span>{total} total</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>{page} / {totalPages}</span>
            <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
