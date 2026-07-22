import { useState } from "react";

type WorkingPaper = {
  id: number;
  title: string;
  type: string;
  status: string;
  uploadedBy: string;
  date: string;
};

export default function WorkingPapersView() {
  const [papers] = useState<WorkingPaper[]>([
    { id: 1, title: "Material Master Data Dictionary v2.1", type: "Documentation", status: "Approved", uploadedBy: "R. Sharma", date: "2026-07-15" },
    { id: 2, title: "HSN/GST Mapping Audit Checklist", type: "Checklist", status: "Review", uploadedBy: "P. Mehta", date: "2026-07-14" },
    { id: 3, title: "UOM Conversion Rules - Process Note", type: "Process Note", status: "Draft", uploadedBy: "A. Kumar", date: "2026-07-12" },
    { id: 4, title: "Valuation Class Configuration Review", type: "Audit Evidence", status: "Draft", uploadedBy: "S. Patel", date: "2026-07-10" },
    { id: 5, title: "Duplicate Item Reconciliation Report", type: "Report", status: "Approved", uploadedBy: "R. Sharma", date: "2026-07-08" },
    { id: 6, title: "Material Master Governance SOP", type: "SOP", status: "Review", uploadedBy: "L. Vance", date: "2026-07-05" },
  ]);

  const handleUpload = () => {
    document.createElement("input").click();
    console.log("Upload dialog triggered");
  };

  const handleEvidence = (id: number) => {
    alert("Link evidence for paper " + id);
  };

  const total = papers.length;
  const draft = papers.filter((p) => p.status === "Draft").length;
  const review = papers.filter((p) => p.status === "Review").length;
  const approved = papers.filter((p) => p.status === "Approved").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Total Papers", value: total, color: "var(--navy)" },
          { label: "Draft", value: draft, color: "var(--slate)" },
          { label: "Review", value: review, color: "var(--gold)" },
          { label: "Approved", value: approved, color: "var(--success)" },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{c.label}</div>
            <h2 style={{ margin: "4px 0 0", color: c.color }}>{c.value}</h2>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4 style={{ color: "var(--navy)", margin: 0 }}>Working Papers & Evidence</h4>
          <button className="btn btn-gold" onClick={handleUpload}>Upload Document</button>
        </div>

        {papers.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--slate)" }}>No working papers uploaded yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td><span className="badge badge-slate">{p.type}</span></td>
                  <td><span className={`badge ${p.status === "Approved" ? "badge-success" : p.status === "Review" ? "badge-gold" : "badge-slate"}`}>{p.status}</span></td>
                  <td>{p.uploadedBy}</td>
                  <td style={{ fontSize: 13 }}>{p.date}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => alert("View paper " + p.id)}>View</button>
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => handleEvidence(p.id)}>Evidence</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
