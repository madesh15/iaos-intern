import { useEffect, useState } from "react";
import { get, post, api, del } from "../../lib/api";

interface RegistryItem {
  id: number;
  registry_type: string;
  compliance_name: string;
  reference_law: string;
  frequency: string;
  due_date: string | null;
  status: string;
  last_reviewed: string;
  assigned_owner: string;
  notes: string;
}

interface ComplianceRegistryViewProps {
  registryType: string;
  title: string;
  onMutation?: () => void;
}

export default function ComplianceRegistryView({
  registryType,
  title,
  onMutation,
}: ComplianceRegistryViewProps) {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLaw, setNewLaw] = useState("");
  const [newFreq, setNewFreq] = useState("Monthly");
  const [newDueDate, setNewDueDate] = useState("");
  const [newStatus, setNewStatus] = useState("COMPLIANT");
  const [newOwner, setNewOwner] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [editingItem, setEditingItem] = useState<RegistryItem | null>(null);

  async function fetchItems() {
    setLoading(true);
    try {
      const data = await get<RegistryItem[]>(
        `/api/modules/labour_law_pf_esi/registry/${registryType}`
      );
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch registry items", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [registryType]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newLaw.trim() || !newOwner.trim()) return;

    try {
      await post(`/api/modules/labour_law_pf_esi/registry/${registryType}`, {
        registry_type: registryType.toUpperCase(),
        compliance_name: newName,
        reference_law: newLaw,
        frequency: newFreq,
        due_date: newDueDate || null,
        status: newStatus,
        assigned_owner: newOwner,
        notes: newNotes,
      });
      // Reset form
      setNewName("");
      setNewLaw("");
      setNewFreq("Monthly");
      setNewDueDate("");
      setNewStatus("COMPLIANT");
      setNewOwner("");
      setNewNotes("");
      setShowAddForm(false);
      fetchItems();
      if (onMutation) onMutation();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateStatus(item: RegistryItem, status: string) {
    try {
      await api(
        `/api/modules/labour_law_pf_esi/registry/${registryType}/${item.id}`,
        { method: "PUT", body: JSON.stringify({ status }) }
      );
      fetchItems();
      if (onMutation) onMutation();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(itemId: number) {
    if (!confirm("Are you sure you want to delete this registry item?")) return;
    try {
      await del(
        `/api/modules/labour_law_pf_esi/registry/${registryType}/${itemId}`
      );
      fetchItems();
      if (onMutation) onMutation();
    } catch (err) {
      console.error(err);
    }
  }

  const filteredItems = items.filter(
    (it) =>
      it.compliance_name.toLowerCase().includes(search.toLowerCase()) ||
      it.reference_law.toLowerCase().includes(search.toLowerCase()) ||
      it.assigned_owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Panel */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, color: "var(--navy)" }}>{title} Checklist</h2>
          <p style={{ color: "var(--slate)", fontSize: 13, marginTop: 4 }}>
            Manage compliance requirements, licenses, registers and statutory displays
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "Add Requirement"}
        </button>
      </div>

      {/* Add Form Panel */}
      {showAddForm && (
        <form
          className="card"
          style={{ padding: 24, background: "var(--canvas)" }}
          onSubmit={handleAdd}
        >
          <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--navy)" }}>
            New Compliance Requirement
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label>Requirement Name *</label>
              <input
                className="input"
                placeholder="e.g. Form D Muster Roll"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Reference Law *</label>
              <input
                className="input"
                placeholder="e.g. Factories Act, 1948"
                value={newLaw}
                onChange={(e) => setNewLaw(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Frequency</label>
              <select
                className="select"
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
                <option value="One-time">One-time</option>
              </select>
            </div>
            <div className="field">
              <label>Due Date (Optional)</label>
              <input
                className="input"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Assigned Owner *</label>
              <input
                className="input"
                placeholder="e.g. HR Generalist"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Initial Status</label>
              <select
                className="select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="COMPLIANT">Compliant</option>
                <option value="NON_COMPLIANT">Non-Compliant</option>
                <option value="PENDING_RENEWAL">Pending Renewal</option>
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Notes / Description</label>
            <textarea
              className="input"
              rows={3}
              style={{ resize: "vertical", fontFamily: "inherit" }}
              placeholder="Provide context or compliance guidelines..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Record
            </button>
          </div>
        </form>
      )}

      {/* Filter and Table Card */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ marginBottom: 16 }}>
          <input
            className="input"
            type="text"
            placeholder="Search by requirement name, reference law or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        {loading ? (
          <p style={{ padding: "20px 0", color: "var(--slate)" }}>Loading checklist items...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Requirement & Law</th>
                  <th>Freq</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Last Reviewed</th>
                  <th>Notes</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>
                        {it.compliance_name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--slate)" }}>
                        {it.reference_law}
                      </div>
                    </td>
                    <td>{it.frequency}</td>
                    <td>{it.assigned_owner}</td>
                    <td>
                      <select
                        value={it.status}
                        onChange={(e) => handleUpdateStatus(it, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          border: "1px solid var(--line)",
                          cursor: "pointer",
                          backgroundColor:
                            it.status === "COMPLIANT"
                              ? "var(--success-tint)"
                              : it.status === "NON_COMPLIANT"
                              ? "var(--danger-tint)"
                              : "var(--gold-tint)",
                          color:
                            it.status === "COMPLIANT"
                              ? "var(--success)"
                              : it.status === "NON_COMPLIANT"
                              ? "var(--danger)"
                              : "var(--gold-strong)",
                        }}
                      >
                        <option value="COMPLIANT">Compliant</option>
                        <option value="NON_COMPLIANT">Non-Compliant</option>
                        <option value="PENDING_RENEWAL">Pending Renewal</option>
                      </select>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--slate)" }}>
                      {new Date(it.last_reviewed).toLocaleDateString()}
                    </td>
                    <td style={{ maxWidth: 200, fontSize: 13, color: "var(--slate)" }}>
                      {it.notes || "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-ghost"
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          color: "var(--danger)",
                          borderColor: "rgba(180, 35, 24, 0.15)",
                        }}
                        onClick={() => handleDelete(it.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "var(--slate)", padding: 24 }}>
                      No compliance records found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
