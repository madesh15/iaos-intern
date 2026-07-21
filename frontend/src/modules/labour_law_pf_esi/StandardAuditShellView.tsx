import { useEffect, useState } from "react";
import { get, patch } from "../../lib/api";

interface ComplianceException {
  id: number;
  exception_type: string;
  severity: string;
  description: string;
  contractor_name: string;
  worker_uan: string | null;
  audit_date: string;
  status: string;
  capa_plan: string | null;
}

interface Worker {
  id: number;
  contractor_name: string;
  worker_name: string;
  uan: string | null;
  category: string;
  status: string;
}

interface StandardAuditShellViewProps {
  subPage: string;
  onMutation?: () => void;
}

export default function StandardAuditShellView({
  subPage,
  onMutation,
}: StandardAuditShellViewProps) {
  const [exceptions, setExceptions] = useState<ComplianceException[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Sampling States
  const [samplePct, setSamplePct] = useState(40);
  const [selectedWorkers, setSelectedWorkers] = useState<Worker[]>([]);

  // CAPA Edit state
  const [editingExceptionId, setEditingExceptionId] = useState<number | null>(null);
  const [capaText, setCapaText] = useState("");

  // Evidence states
  const [evidenceFiles, setEvidenceFiles] = useState([
    { id: 1, name: "Apex_EPF_Challan_May2026.pdf", category: "PF Challan", uploadedBy: "Apex Admin", date: "2026-06-10", status: "Verified" },
    { id: 2, name: "Vanguard_CLRA_License_2026.pdf", category: "CLRA License", uploadedBy: "Vanguard HR", date: "2026-05-15", status: "Verified" },
    { id: 3, name: "Form_D_MusterRoll_Apex_May.xlsx", category: "Muster Roll", uploadedBy: "Apex Admin", date: "2026-06-05", status: "Under Review" }
  ]);

  async function loadData() {
    setLoading(true);
    try {
      const eData = await get<ComplianceException[]>("/api/modules/labour_law_pf_esi/exceptions");
      setExceptions(eData);
      const wData = await get<Worker[]>("/api/modules/labour_law_pf_esi/workers");
      setWorkers(wData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [subPage]);

  // Generate Audit Sample
  function generateSample() {
    const activeWorkers = workers.filter((w) => w.status === "Active");
    const count = Math.ceil((samplePct / 100) * activeWorkers.length);
    // Shuffle and slice
    const shuffled = [...activeWorkers].sort(() => 0.5 - Math.random());
    setSelectedWorkers(shuffled.slice(0, count));
  }

  // Save CAPA Plan
  async function saveCapaPlan(id: number) {
    try {
      await patch(`/api/modules/labour_law_pf_esi/exceptions/${id}`, {
        capa_plan: capaText,
      });
      setEditingExceptionId(null);
      setCapaText("");
      loadData();
      if (onMutation) onMutation();
    } catch (err) {
      console.error(err);
    }
  }

  // Resolve Exception
  async function resolveException(id: number) {
    try {
      await patch(`/api/modules/labour_law_pf_esi/exceptions/${id}`, {
        status: "RESOLVED",
      });
      loadData();
      if (onMutation) onMutation();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <p style={{ color: "var(--slate)" }}>Loading audit infrastructure data...</p>;
  }

  // 1. RCM Matrix
  if (subPage === "rcm-matrix") {
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Labour Compliance Risk Control Matrix (RCM)</h3>
        <table>
          <thead>
            <tr>
              <th>Risk ID</th>
              <th>Process Area</th>
              <th>Risk Description</th>
              <th>Control Activity</th>
              <th>Frequency</th>
              <th>Control Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>RCM-36-01</strong></td>
              <td>Minimum Wages</td>
              <td>Payment of wages below standard rates causing legal prosecution and penalties.</td>
              <td>Automated comparison of roster wages against state notification thresholds.</td>
              <td>Monthly</td>
              <td>HR Compliance Head</td>
            </tr>
            <tr>
              <td><strong>RCM-36-02</strong></td>
              <td>PF & ESI Remittances</td>
              <td>Non-compliance of PF/ESI deductions and remittances for contractor workers.</td>
              <td>ECR Challan matching with contractor employee muster roll rosters.</td>
              <td>Monthly</td>
              <td>Finance Director</td>
            </tr>
            <tr>
              <td><strong>RCM-36-03</strong></td>
              <td>CLRA Licensing</td>
              <td>Employing contract workers without a valid principal employer registration or contractor license.</td>
              <td>Expiry alerts and mandatory document vault uploads for contractor Form VI.</td>
              <td>Annual</td>
              <td>Operations VP</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // 2. Rule Library
  if (subPage === "rule-library") {
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Legal Compliance Rule Library</h3>
        <table>
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Act / Regulation</th>
              <th>Audit Check Logic</th>
              <th>Automated Exception Code</th>
              <th>Risk Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>RULE-LL-01</strong></td>
              <td>Minimum Wages Act, 1948</td>
              <td>Daily wage rate &gt;= State notified minimum rate for specified cadre.</td>
              <td><code>MIN_WAGE_VIOLATION</code></td>
              <td><span className="badge badge-danger">HIGH</span></td>
            </tr>
            <tr>
              <td><strong>RULE-LL-02</strong></td>
              <td>EPF Act, 1952</td>
              <td>ECR submission covers all active contract workers on the company roster.</td>
              <td><code>MISSING_PF_PROOF</code></td>
              <td><span className="badge badge-gold">MEDIUM</span></td>
            </tr>
            <tr>
              <td><strong>RULE-LL-03</strong></td>
              <td>CLRA Act, 1970</td>
              <td>Valid contractor license (Form VI) must be uploaded if strength &gt;= 20 workers.</td>
              <td><code>EXPIRED_LICENCE</code></td>
              <td><span className="badge badge-gold">MEDIUM</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // 3. Sampling Builder
  if (subPage === "sampling-builder") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
        <div className="card" style={{ padding: 20, height: "fit-content" }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Sampling Configurator</h3>
          <div className="field">
            <label>Total Active Roster: <strong>{workers.filter(w => w.status === "Active").length} workers</strong></label>
          </div>
          <div className="field">
            <label>Sample Percentage ({samplePct}%)</label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              style={{ width: "100%", accentColor: "var(--navy)" }}
              value={samplePct}
              onChange={(e) => setSamplePct(Number(e.target.value))}
            />
          </div>
          <button className="btn btn-primary btn-block" onClick={generateSample}>
            Build Random Sample Pool
          </button>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Sample Pool ({selectedWorkers.length} workers selected)</h3>
          {selectedWorkers.length === 0 ? (
            <p style={{ color: "var(--slate)", fontStyle: "italic" }}>No samples generated yet. Configure options and click Build.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Contractor</th>
                  <th>UAN</th>
                  <th>Cadre</th>
                </tr>
              </thead>
              <tbody>
                {selectedWorkers.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600 }}>{w.worker_name}</td>
                    <td>{w.contractor_name}</td>
                    <td>{w.uan || "—"}</td>
                    <td>{w.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // 4. Evidence Vault
  if (subPage === "evidence-vault") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Evidence Digital Vault</h3>
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {evidenceFiles.map((file) => (
                <tr key={file.id}>
                  <td style={{ fontWeight: 600, color: "var(--navy)" }}>{file.name}</td>
                  <td>{file.category}</td>
                  <td>{file.uploadedBy}</td>
                  <td>{file.date}</td>
                  <td>
                    <span className={`badge ${file.status === "Verified" ? "badge-success" : "badge-gold"}`}>
                      {file.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card" style={{ padding: 20, borderStyle: "dashed", borderWidth: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 250 }}>
          <span style={{ fontSize: 32, marginBottom: 10 }}>📤</span>
          <h4 style={{ color: "var(--navy)" }}>Upload Audit Proof</h4>
          <p style={{ fontSize: 12, color: "var(--slate)", margin: "8px 0 16px 0", textAlign: "center" }}>
            Drag and drop ECR Challans, License certificates, or muster registers to verify.
          </p>
          <button className="btn btn-ghost">Select File</button>
        </div>
      </div>
    );
  }

  // 5. Audit Dashboard & Live Risk Index (integrated in page, but standard details here)
  if (subPage === "risk-dashboard") {
    const totalExceptions = exceptions.length;
    const openCount = exceptions.filter(e => e.status === "OPEN").length;
    const resolvedCount = exceptions.filter(e => e.status === "RESOLVED").length;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 20, textAlign: "center" }}>
            <h4 style={{ color: "var(--slate)", fontSize: 13 }}>Total Exceptions Logged</h4>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: "var(--navy)" }}>{totalExceptions}</div>
          </div>
          <div className="card" style={{ padding: 20, textAlign: "center", borderLeft: "4px solid var(--danger)" }}>
            <h4 style={{ color: "var(--slate)", fontSize: 13 }}>Open Exceptions</h4>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: "var(--danger)" }}>{openCount}</div>
          </div>
          <div className="card" style={{ padding: 20, textAlign: "center", borderLeft: "4px solid var(--success)" }}>
            <h4 style={{ color: "var(--slate)", fontSize: 13 }}>Resolved Exceptions</h4>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: "var(--success)" }}>{resolvedCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Live Risk Matrix (Active Red Flags)</h3>
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Category</th>
                <th>Contractor</th>
                <th>Description</th>
                <th>Logged Date</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.filter(e => e.status === "OPEN").map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className={`badge ${e.severity === "HIGH" ? "badge-danger" : "badge-gold"}`}>
                      {e.severity}
                    </span>
                  </td>
                  <td>{e.exception_type}</td>
                  <td>{e.contractor_name}</td>
                  <td style={{ fontSize: 13 }}>{e.description}</td>
                  <td style={{ color: "var(--slate)" }}>{new Date(e.audit_date).toLocaleDateString()}</td>
                </tr>
              ))}
              {exceptions.filter(e => e.status === "OPEN").length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--slate)" }}>No active red flags. Clear compliance!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 6. Finding Logs
  if (subPage === "finding-logs") {
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Non-Compliance Finding Logs</h3>
        <table>
          <thead>
            <tr>
              <th>Finding ID</th>
              <th>Contractor</th>
              <th>Category</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((e) => (
              <tr key={e.id}>
                <td><strong>FND-36-{e.id}</strong></td>
                <td style={{ fontWeight: 600 }}>{e.contractor_name}</td>
                <td>{e.exception_type}</td>
                <td style={{ fontSize: 13, maxWidth: 300 }}>{e.description}</td>
                <td>
                  <span className={`badge ${e.severity === "HIGH" ? "badge-danger" : "badge-gold"}`}>
                    {e.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge ${e.status === "OPEN" ? "badge-danger" : "badge-success"}`}>
                    {e.status}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  {e.status === "OPEN" && (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                      onClick={() => resolveException(e.id)}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 7. CAPA Action Tracker
  if (subPage === "capa-tracker") {
    const pendingCapa = exceptions.filter(e => e.status === "OPEN");
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>CAPA Action Tracker (Corrective & Preventive Actions)</h3>
        <table>
          <thead>
            <tr>
              <th>Finding</th>
              <th>Contractor</th>
              <th>CAPA Action Plan</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingCapa.map((e) => (
              <tr key={e.id}>
                <td style={{ width: "35%", fontSize: 13 }}>
                  <div style={{ fontWeight: 600, color: "var(--navy)" }}>{e.exception_type}</div>
                  <div style={{ color: "var(--slate)", marginTop: 4 }}>{e.description}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{e.contractor_name}</td>
                <td>
                  {editingExceptionId === e.id ? (
                    <textarea
                      className="input"
                      rows={2}
                      value={capaText}
                      onChange={(e) => setCapaText(e.target.value)}
                      style={{ width: "100%", fontSize: 13 }}
                    />
                  ) : (
                    <span style={{ fontSize: 13, color: e.capa_plan ? "var(--ink)" : "var(--slate-soft)", fontStyle: e.capa_plan ? "normal" : "italic" }}>
                      {e.capa_plan || "No CAPA plan defined yet. Provide actions to resolve."}
                    </span>
                  )}
                </td>
                <td style={{ textAlign: "right", verticalAlign: "middle" }}>
                  {editingExceptionId === e.id ? (
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => setEditingExceptionId(null)}>Cancel</button>
                      <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => saveCapaPlan(e.id)}>Save</button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                      onClick={() => {
                        setEditingExceptionId(e.id);
                        setCapaText(e.capa_plan || "");
                      }}
                    >
                      Update CAPA
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {pendingCapa.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--slate)" }}>No active exceptions requiring CAPA.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // 8. PF/ESI Defaulter Escalations
  if (subPage === "defaulter-escalation") {
    const highRiskContractors = [
      { name: "Vanguard Facilities", openExceptions: 1, severity: "HIGH", holdPaymentStatus: "Hold Applied", lastEscalated: "2026-06-12" },
      { name: "Apex Logistics", openExceptions: 1, severity: "MEDIUM", holdPaymentStatus: "Active Warning", lastEscalated: "2026-06-08" }
    ];
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>PF/ESI Defaulter Escalation Panel</h3>
        <table>
          <thead>
            <tr>
              <th>Contractor Name</th>
              <th>Open Compliance Red Flags</th>
              <th>Risk Severity</th>
              <th>Holding/Escalation Stage</th>
              <th>Last Escalaed Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {highRiskContractors.map((c, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.openExceptions} unresolved exceptions</td>
                <td>
                  <span className={`badge ${c.severity === "HIGH" ? "badge-danger" : "badge-gold"}`}>
                    {c.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge ${c.holdPaymentStatus.includes("Hold") ? "badge-danger" : "badge-gold"}`}>
                    {c.holdPaymentStatus}
                  </span>
                </td>
                <td>{c.lastEscalated}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, marginRight: 6 }} onClick={() => alert(`Escalated notification to ${c.name}`)}>
                    Escalate
                  </button>
                  <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => alert(`Payments hold status updated for ${c.name}`)}>
                    Modify Hold
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 9. Underpayment Recovery Register
  if (subPage === "underpayment-recovery") {
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Under-payment Recovery Register</h3>
        <table>
          <thead>
            <tr>
              <th>Worker Name</th>
              <th>Contractor</th>
              <th>Calculated Discrepancy</th>
              <th>Recovery Status</th>
              <th>Verification Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Priya Sharma</td>
              <td>Vanguard Facilities</td>
              <td style={{ fontWeight: 600, color: "var(--danger)" }}>Rs. 2,100 (Haryana - Unskilled cadre)</td>
              <td><span className="badge badge-gold">Recovery Pending</span></td>
              <td>2026-06-14</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // 10. Compliance Certificate Generator
  if (subPage === "compliance-cert") {
    const hasOpenHighExc = exceptions.some(e => e.severity === "HIGH" && e.status === "OPEN");
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <h3 style={{ fontSize: 16, marginBottom: 10 }}>Compliance Certificate Generator</h3>
        <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 20 }}>
          Generate formal compliance certificates confirming your adherence to Labour Law, PF and ESIC mandates.
        </p>

        {hasOpenHighExc ? (
          <div style={{ background: "var(--danger-tint)", color: "var(--danger)", padding: 18, borderRadius: 12, display: "inline-block", maxWidth: 500 }}>
            <strong>🔴 Grade Blocked:</strong> Compliance certificate generation is blocked because your organization currently has unresolved HIGH severity exceptions. Resolve these in the finding logs to generate.
          </div>
        ) : (
          <div style={{ border: "2px solid var(--gold)", padding: 30, borderRadius: 12, display: "inline-block", maxWidth: 600, background: "var(--gold-tint)" }}>
            <span style={{ fontSize: 44 }}>🏆</span>
            <h2 style={{ color: "var(--navy)", fontSize: 20, margin: "14px 0" }}>Certificate of Labour Compliance</h2>
            <p style={{ fontSize: 12, color: "var(--slate)", lineHeight: 1.6 }}>
              This certifies that the tenant organization has successfully completed audits across statutory registers, licenses, minimum wages, and PF/ESI challans. No outstanding high-priority exceptions are active.
            </p>
            <div style={{ marginTop: 20, fontWeight: 700, color: "var(--gold-strong)", fontSize: 13 }}>
              GRADE: A COMPLIANT
            </div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => alert("Certificate download started!")}>
              Download Official Certificate
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
