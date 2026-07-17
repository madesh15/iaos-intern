import { useState, useRef } from "react";

export default function WorkingPapersEvidencePage() {
  const [files, setFiles] = useState([
    { name: "Cycle_Count_Q3.pdf", type: "PDF", uploadedBy: "Alice", status: "Signed Off" },
    { name: "CCTV_Logs_July.xlsx", type: "Spreadsheet", uploadedBy: "Bob", status: "Pending Review" },
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (!selectedFile) return;

    let type = "Document";
    const nameLower = selectedFile.name.toLowerCase();
    if (nameLower.endsWith(".pdf")) type = "PDF";
    else if (nameLower.match(/\.(xls|xlsx|csv)$/)) type = "Spreadsheet";
    else if (nameLower.match(/\.(doc|docx)$/)) type = "Word";

    const newFile = {
      name: selectedFile.name,
      type,
      uploadedBy: "Me",
      status: "Pending Review",
    };

    setFiles([newFile, ...files]);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 2fr" }}>
      <div className="card" style={{ padding: 22, height: "fit-content" }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Upload Evidence</h3>
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ marginBottom: 16 }} 
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <button 
          className="btn btn-primary btn-block" 
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          Upload
        </button>
      </div>
      
      <div className="card" style={{ padding: 22, overflowX: "auto" }}>
        <h2 style={{ color: "var(--navy)", marginBottom: 16 }}>Working Papers</h2>
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Type</th>
              <th>Uploaded By</th>
              <th style={{ whiteSpace: "nowrap" }}>Sign-off Status</th>
            </tr>
          </thead>
          <tbody>
            {files.map(row => (
              <tr key={row.name}>
                <td><strong>{row.name}</strong></td>
                <td>{row.type}</td>
                <td>{row.uploadedBy}</td>
                <td><span className={`badge ${row.status === 'Signed Off' ? 'badge-success' : 'badge-gold'}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
