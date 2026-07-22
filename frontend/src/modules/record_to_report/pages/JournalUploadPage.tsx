import React, { useState, useRef } from "react";
import { EmptyState } from "../components";

export default function JournalUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").slice(0, 11);
      setPreview(lines.map((l) => l.split(",")));
    };
    reader.readAsText(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>Journal Upload</h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>Upload journal entries via CSV or Excel files</p>

      <div
        className="card"
        style={{
          padding: "2.5rem",
          textAlign: "center",
          border: dragOver ? "2px dashed var(--gold)" : "2px dashed var(--line)",
          background: dragOver ? "var(--gold-tint)" : "var(--surface)",
          transition: "all 0.2s",
          cursor: "pointer",
          marginBottom: "1.25rem",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📁</div>
        <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "0.25rem" }}>
          {file ? file.name : "Drag & drop your file here"}
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>
          {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports CSV and Excel (.csv, .xlsx, .xls)"}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.75rem" }}>Preview (first 10 rows)</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr>
                  {preview[0]?.map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "0.5rem 0.75rem", borderBottom: "2px solid var(--line)", color: "var(--slate)", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: "0.4rem 0.75rem", borderBottom: "1px solid var(--line-soft)" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button className="btn btn-primary" disabled={!file}>Upload File</button>
        <button className="btn btn-ghost" disabled={!file}>Process & Validate</button>
      </div>
    </div>
  );
}
