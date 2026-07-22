import { useEffect, useState } from "react";
import { get, post } from "../../lib/api";

interface Worker {
  id: number;
  contractor_name: string;
  worker_name: string;
  uan: string | null;
  esic_ip: string | null;
  wage_rate: number;
  category: string;
  doj: string;
  status: string;
}

interface ComplianceException {
  id: number;
  exception_type: string;
  severity: string;
  description: string;
  contractor_name: string;
  worker_uan: string | null;
  audit_date: string;
  status: string;
}

interface AnalyticsCalculatorViewProps {
  calculatorType: "min-wage-audit" | "ecr-challan-audit";
  onExceptionGenerated?: () => void;
}

const MINIMUM_WAGE_STANDARDS: Record<string, Record<string, number>> = {
  Haryana: { Skilled: 550, "Semi-Skilled": 420, Unskilled: 350 },
  Delhi: { Skilled: 680, "Semi-Skilled": 520, Unskilled: 450 },
  Karnataka: { Skilled: 580, "Semi-Skilled": 460, Unskilled: 380 },
  Maharashtra: { Skilled: 620, "Semi-Skilled": 490, Unskilled: 400 },
};

export default function AnalyticsCalculatorView({
  calculatorType,
  onExceptionGenerated,
}: AnalyticsCalculatorViewProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [exceptions, setExceptions] = useState<ComplianceException[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [auditResults, setAuditResults] = useState<{
    totalAudited: number;
    violationsFound: number;
    passedCount: number;
  } | null>(null);

  // Wage audit states
  const [selectedState, setSelectedState] = useState("Haryana");

  // ECR Audit states
  const [ecrRoster, setEcrRoster] = useState([
    { contractor: "Apex Logistics", challanMonth: "May 2026", challanWorkersCount: 1, epfPaid: 2160, status: "Pending Audit" },
    { contractor: "Vanguard Facilities", challanMonth: "May 2026", challanWorkersCount: 2, epfPaid: 4800, status: "Pending Audit" },
    { contractor: "Delta Security Services", challanMonth: "May 2026", challanWorkersCount: 1, epfPaid: 2400, status: "Pending Audit" }
  ]);

  async function loadData() {
    setLoading(true);
    try {
      const wData = await get<Worker[]>("/api/modules/labour_law_pf_esi/workers");
      setWorkers(wData);
      const eData = await get<ComplianceException[]>("/api/modules/labour_law_pf_esi/exceptions");
      setExceptions(eData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    setAuditLog([]);
    setAuditResults(null);
  }, [calculatorType]);

  async function runWageAudit() {
    setAuditing(true);
    setAuditLog(["Initializing Wage Audit Engine...", `Loading statutory minimum rates for state: ${selectedState}...`]);
    setAuditResults(null);

    const minRates = MINIMUM_WAGE_STANDARDS[selectedState];
    let violations = 0;
    let logs: string[] = [];

    // Simulate audit engine processing delay
    await new Promise((r) => setTimeout(r, 1200));

    for (const worker of workers) {
      const requiredMin = minRates[worker.category] || 350;
      logs.push(`Auditing worker: ${worker.worker_name} (${worker.contractor_name}) - Category: ${worker.category}. Paid: Rs. ${worker.wage_rate}/day. Required: Rs. ${requiredMin}/day.`);
      
      if (worker.wage_rate < requiredMin) {
        violations++;
        logs.push(`🔴 ALERT: Underpayment detected for ${worker.worker_name}! Paid Rs. ${worker.wage_rate} vs Required Rs. ${requiredMin}.`);
        
        // Log exception on the backend
        try {
          await post("/api/modules/labour_law_pf_esi/exceptions", {
            exception_type: "MIN_WAGE_VIOLATION",
            severity: "HIGH",
            description: `Worker ${worker.worker_name} was paid Rs. ${worker.wage_rate}/day, which is below the statutory minimum wage threshold of Rs. ${requiredMin}/day for ${worker.category} contract labor in ${selectedState}.`,
            contractor_name: worker.contractor_name,
            worker_uan: worker.uan,
            status: "OPEN",
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        logs.push(`✅ Worker ${worker.worker_name} is compliant.`);
      }
    }

    logs.push("Audit execution completed successfully.");
    setAuditLog(logs);
    setAuditResults({
      totalAudited: workers.length,
      violationsFound: violations,
      passedCount: workers.length - violations,
    });
    setAuditing(false);
    loadData();
    if (onExceptionGenerated) onExceptionGenerated();
  }

  async function runEcrAudit() {
    setAuditing(true);
    setAuditLog(["Initializing ECR & Challan Verification Engine...", "Scanning contractor master records vs uploaded challan rosters..."]);
    setAuditResults(null);

    let violations = 0;
    let logs: string[] = [];

    await new Promise((r) => setTimeout(r, 1200));

    // Calculate worker counts from master database grouped by contractor
    const contractorCounts: Record<string, number> = {};
    workers.forEach((w) => {
      if (w.status === "Active") {
        contractorCounts[w.contractor_name] = (contractorCounts[w.contractor_name] || 0) + 1;
      }
    });

    const updatedEcr = ecrRoster.map((item) => {
      const masterCount = contractorCounts[item.contractor] || 0;
      logs.push(`Auditing contractor: ${item.contractor} - Challan workers: ${item.challanWorkersCount}, Master roster count: ${masterCount}.`);
      
      if (item.challanWorkersCount < masterCount) {
        violations++;
        logs.push(`🔴 ALERT: Roster mismatch for ${item.contractor}! Challan covers ${item.challanWorkersCount} workers but master roster lists ${masterCount} active workers.`);
        
        // Log exception on the backend
        post("/api/modules/labour_law_pf_esi/exceptions", {
          exception_type: "MISSING_PF_PROOF",
          severity: "MEDIUM",
          description: `EPF Challan uploaded by contractor ${item.contractor} for ${item.challanMonth} is under-reported. Covers only ${item.challanWorkersCount} workers, whereas master roster records ${masterCount} active workers. Potential PF evasion.`,
          contractor_name: item.contractor,
          status: "OPEN",
        }).catch(err => console.error(err));

        return { ...item, status: "Discrepancy Flagged" };
      } else {
        logs.push(`✅ Contractor ${item.contractor} ECR verified successfully.`);
        return { ...item, status: "Verified" };
      }
    });

    setEcrRoster(updatedEcr);
    logs.push("ECR Verification audit completed.");
    setAuditLog(logs);
    setAuditResults({
      totalAudited: ecrRoster.length,
      violationsFound: violations,
      passedCount: ecrRoster.length - violations,
    });
    setAuditing(false);
    loadData();
    if (onExceptionGenerated) onExceptionGenerated();
  }

  if (loading) {
    return <p style={{ color: "var(--slate)" }}>Loading audit analytics data...</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
      {/* Left Pane - Dataset Compare Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {calculatorType === "min-wage-audit" ? (
          <>
            <div className="card" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 16 }}>Roster Wages</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--slate)" }}>State Law:</label>
                  <select
                    className="select"
                    style={{ padding: "4px 8px", fontSize: 13, width: 140 }}
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    {Object.keys(MINIMUM_WAGE_STANDARDS).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Statutory standards overview */}
              <div
                style={{
                  background: "var(--navy-tint)",
                  padding: 12,
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  fontSize: 12,
                  border: "1px solid var(--line)"
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--navy)" }}>Statutory minimums:</span>
                {Object.entries(MINIMUM_WAGE_STANDARDS[selectedState]).map(([cat, val]) => (
                  <span key={cat}>
                    <strong>{cat}:</strong> Rs. {val}
                  </span>
                ))}
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Contractor</th>
                    <th>Cadre</th>
                    <th>Daily Wage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 600 }}>{w.worker_name}</td>
                      <td>{w.contractor_name}</td>
                      <td>{w.category}</td>
                      <td style={{ fontWeight: 600 }}>Rs. {w.wage_rate}</td>
                      <td>
                        <span
                          className={`badge ${
                            w.status === "Active" ? "badge-success" : "badge-slate"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Uploaded ECR Challans (May 2026)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Contractor</th>
                    <th>Challan Month</th>
                    <th>Workers Covered</th>
                    <th>EPF Contribution</th>
                    <th>Roster Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ecrRoster.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.contractor}</td>
                      <td>{item.challanMonth}</td>
                      <td>{item.challanWorkersCount} workers</td>
                      <td>Rs. {item.epfPaid}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "Verified"
                              ? "badge-success"
                              : item.status === "Discrepancy Flagged"
                              ? "badge-danger"
                              : "badge-gold"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Right Pane - Rule Engine & Output */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="card" style={{ padding: 22, height: "100%", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: 16, marginBottom: 14, color: "var(--navy)" }}>Compliance Audit Engine</h3>
          
          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: 12, display: "flex", justifyContent: "center", gap: 10 }}
            disabled={auditing}
            onClick={calculatorType === "min-wage-audit" ? runWageAudit : runEcrAudit}
          >
            {auditing ? (
              <>
                <span className="loader" style={{ border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", width: 14, height: 14, display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                Auditing...
              </>
            ) : calculatorType === "min-wage-audit" ? (
              "Run Wage Auditing Engine"
            ) : (
              "Run ECR Verification Engine"
            )}
          </button>

          {/* Audit output console */}
          <div
            style={{
              flex: 1,
              marginTop: 18,
              background: "#071528",
              borderRadius: "var(--radius-sm)",
              padding: 16,
              color: "#38ef7d",
              fontFamily: "monospace",
              fontSize: 12,
              lineHeight: 1.6,
              overflowY: "auto",
              maxHeight: 320,
              minHeight: 220,
              border: "1px solid var(--navy-deep)"
            }}
          >
            {auditLog.length === 0 ? (
              <span style={{ color: "#7b8698" }}>Console ready. Click button to run rules.</span>
            ) : (
              auditLog.map((line, idx) => (
                <div key={idx} style={{ color: line.startsWith("🔴") ? "#ff4d4d" : line.startsWith("✅") ? "#38ef7d" : "#eef1f6" }}>
                  {line}
                </div>
              ))
            )}
          </div>

          {/* Audit KPI stats output */}
          {auditResults && (
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                textAlign: "center"
              }}
            >
              <div style={{ background: "var(--canvas)", padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>{auditResults.totalAudited}</div>
                <div style={{ fontSize: 10, color: "var(--slate)" }}>Audited</div>
              </div>
              <div style={{ background: "var(--canvas)", padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--success)" }}>{auditResults.passedCount}</div>
                <div style={{ fontSize: 10, color: "var(--slate)" }}>Passed</div>
              </div>
              <div style={{ background: "var(--canvas)", padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--danger)" }}>{auditResults.violationsFound}</div>
                <div style={{ fontSize: 10, color: "var(--slate)" }}>Violations</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
