import { useEffect, useRef, useState } from "react";
import { get } from "../../lib/api";

const BASE = "/api/modules/related_party_transactions";

type Batch = {
  id: number;
  filename: string;
  uploaded_by: string;
  uploaded_at: string;
  total_rows: number;
  valid_count: number;
  flagged_count: number;
  error_count: number;
  status: string;
};

type Txn = {
  id: number;
  row_num: number;
  related_party: string;
  transaction_type: string;
  amount: number;
  currency: string;
  transaction_date: string | null;
  market_rate: number | null;
  variance_pct: number | null;
  status: string;
  validation_notes: string;
};

const STATUS_COLOR: Record<string, string> = {
  valid: "#16a34a",
  flagged: "#d97706",
  error: "#dc2626",
};

export default function BulkImportTab() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [rows, setRows] = useState<Txn[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadBatches = () => get(`${BASE}/import/batches`).then(setBatches);

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      get(`${BASE}/import/batches/${selectedBatch}/transactions`).then(setRows);
    }
  }, [selectedBatch]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const token = localStorage.getItem("iaos_token");
      const res = await fetch(`${BASE}/import/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        alert(`Upload failed: ${text}`);
        return;
      }
      const batch: Batch = await res.json();
      await loadBatches();
      setSelectedBatch(batch.id);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const downloadTemplate = async () => {
    const data = await get(`${BASE}/import/template`);
    const blob = new Blob([data.content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>Bulk Import</h3>
          <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: 14 }}>
            Upload a CSV or XLSX of related-party transactions. Rows are auto-validated —
            missing data or price variance beyond 10% is flagged and logged as an exception.
          </p>
        </div>
        <button className="btn" onClick={downloadTemplate}>
          Download template
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInput.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "#2563eb" : "#ccc"}`,
          borderRadius: 8,
          padding: 32,
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 20,
          background: dragOver ? "#eff6ff" : "transparent",
        }}
      >
        <input
          ref={fileInput}
          type="file"
          accept=".csv,.xlsx"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
        {uploading ? "Uploading & validating..." : "Drag a .csv or .xlsx file here, or click to browse"}
      </div>

      <h4>Import History</h4>
      <table className="table">
        <thead>
          <tr>
            <th>File</th>
            <th>Uploaded</th>
            <th>Rows</th>
            <th>Valid</th>
            <th>Flagged</th>
            <th>Errors</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id} style={{ background: selectedBatch === b.id ? "#f3f4f6" : undefined }}>
              <td>{b.filename}</td>
              <td>{new Date(b.uploaded_at).toLocaleString()}</td>
              <td>{b.total_rows}</td>
              <td style={{ color: STATUS_COLOR.valid }}>{b.valid_count}</td>
              <td style={{ color: STATUS_COLOR.flagged }}>{b.flagged_count}</td>
              <td style={{ color: STATUS_COLOR.error }}>{b.error_count}</td>
              <td>
                <button className="btn" onClick={() => setSelectedBatch(b.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedBatch && (
        <>
          <h4 style={{ marginTop: 24 }}>Records — Batch #{selectedBatch}</h4>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Related Party</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Variance</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.row_num}</td>
                  <td>{r.related_party}</td>
                  <td>{r.transaction_type}</td>
                  <td>{r.currency} {r.amount.toLocaleString()}</td>
                  <td>{r.transaction_date || "—"}</td>
                  <td>{r.variance_pct != null ? `${r.variance_pct > 0 ? "+" : ""}${r.variance_pct}%` : "—"}</td>
                  <td>
                    <span style={{ color: STATUS_COLOR[r.status], fontWeight: 600 }}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, opacity: 0.8 }}>{r.validation_notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
