import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

const SLUG = "trade_scheme_promotion_audit";

interface Claim {
  id: number;
  claim_id: string;
  distributor_name: string;
  scheme_code: string;
  channel: string;
  claim_amount: number;
  settled_amount: number;
  proof_of_performance: boolean;
  validation_status: string;
  settlement_status: string;
  duplicate_flag: boolean;
  duplicate_claim_refs: string;
  inflation_flag: boolean;
  ageing_days: number;
  claim_date: string | null;
  settlement_date: string | null;
  notes: string;
}

const VALIDATION_STATUSES = ["Valid", "Invalid", "Pending", "Under Review"];
const SETTLEMENT_STATUSES = ["Settled", "Partial", "Unsettled", "Rejected"];

export default function ClaimValidationSettlementView() {
  const [items, setItems] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    claim_id: "",
    distributor_name: "",
    scheme_code: "",
    channel: "Modern Trade",
    claim_amount: 0,
    settled_amount: 0,
    proof_of_performance: false,
    validation_status: "Pending",
    settlement_status: "Unsettled",
    ageing_days: 0,
    claim_date: "",
    notes: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Claim[]>(`/api/modules/${SLUG}/claims`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.claim_id || !form.distributor_name) return;
    await post(`/api/modules/${SLUG}/claims`, {
      ...form,
      claim_date: form.claim_date || null,
    });
    setForm({ claim_id: "", distributor_name: "", scheme_code: "", channel: "Modern Trade", claim_amount: 0, settled_amount: 0, proof_of_performance: false, validation_status: "Pending", settlement_status: "Unsettled", ageing_days: 0, claim_date: "", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/claims/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Claim Validation & Settlement</h3>
          <span className="badge badge-gold">{items.length} Claims</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading claims...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Claim</th>
                <th>Distributor</th>
                <th>Claimed / Settled</th>
                <th>PoP</th>
                <th>Validation</th>
                <th>Settlement</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.claim_id}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>{c.scheme_code}</div>
                  </td>
                  <td>{c.distributor_name}</td>
                  <td>{c.claim_amount.toLocaleString()} / {c.settled_amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${c.proof_of_performance ? "badge-success" : "badge-danger"}`}>
                      {c.proof_of_performance ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.validation_status === "Valid" ? "badge-success" : c.validation_status === "Invalid" ? "badge-danger" : "badge-gold"}`}>
                      {c.validation_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.settlement_status === "Settled" ? "badge-success" : c.settlement_status === "Rejected" ? "badge-danger" : "badge-gold"}`}>
                      {c.settlement_status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No claims registered yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Claim</h3>
        <div className="field">
          <label>Claim ID</label>
          <input className="input" value={form.claim_id} onChange={(e) => setForm({ ...form, claim_id: e.target.value })} placeholder="e.g. CLM-001" required />
        </div>
        <div className="field">
          <label>Distributor Name</label>
          <input className="input" value={form.distributor_name} onChange={(e) => setForm({ ...form, distributor_name: e.target.value })} required />
        </div>
        <div className="field">
          <label>Scheme Code</label>
          <input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Claim Amount</label>
            <input className="input" type="number" value={form.claim_amount} onChange={(e) => setForm({ ...form, claim_amount: Number(e.target.value) })} min={0} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Settled Amount</label>
            <input className="input" type="number" value={form.settled_amount} onChange={(e) => setForm({ ...form, settled_amount: Number(e.target.value) })} min={0} />
          </div>
        </div>
        <div className="field">
          <label>Proof of Performance</label>
          <select className="select" value={form.proof_of_performance ? "true" : "false"} onChange={(e) => setForm({ ...form, proof_of_performance: e.target.value === "true" })}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="field">
          <label>Validation Status</label>
          <select className="select" value={form.validation_status} onChange={(e) => setForm({ ...form, validation_status: e.target.value })}>
            {VALIDATION_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Settlement Status</label>
          <select className="select" value={form.settlement_status} onChange={(e) => setForm({ ...form, settlement_status: e.target.value })}>
            {SETTLEMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-block">Register Claim</button>
      </form>
    </div>
  );
}
