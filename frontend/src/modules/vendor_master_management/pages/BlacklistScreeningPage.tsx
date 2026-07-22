import React from "react";
import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { DataTable, Badge, LoadingSpinner, EmptyState } from "../components";

export default function BlacklistScreeningPage() {
  const { data, loading, error, reload } = useFetch(() => vendorApi.blacklist());

  const [form, setForm] = React.useState({
    vendor_name: "",
    pan_number: "",
    gst_number: "",
    source: "",
    reason: "",
  });
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vendor_name.trim()) return;
    setSubmitting(true);
    try {
      await vendorApi.addToBlacklist({
        vendor_name: form.vendor_name,
        pan_number: form.pan_number || null,
        gst_number: form.gst_number || null,
        source: form.source,
        reason: form.reason || null,
        listed_date: new Date().toISOString().split("T")[0],
      });
      setForm({ vendor_name: "", pan_number: "", gst_number: "", source: "", reason: "" });
      reload();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--navy)", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Blacklist Screening
        </h2>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          Vendors matching internal or government blacklists
        </p>
      </div>

      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ color: "var(--navy)", fontSize: "1rem", fontWeight: 600, margin: "0 0 1rem" }}>
          Add to Blacklist
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", alignItems: "end" }}>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: "0.8rem", color: "var(--slate)", display: "block", marginBottom: 4 }}>Vendor Name *</label>
            <input
              className="input"
              value={form.vendor_name}
              onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
              required
              placeholder="Vendor name"
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: "0.8rem", color: "var(--slate)", display: "block", marginBottom: 4 }}>PAN Number</label>
            <input
              className="input"
              value={form.pan_number}
              onChange={(e) => setForm({ ...form, pan_number: e.target.value })}
              placeholder="PAN"
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: "0.8rem", color: "var(--slate)", display: "block", marginBottom: 4 }}>GST Number</label>
            <input
              className="input"
              value={form.gst_number}
              onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
              placeholder="GST"
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: "0.8rem", color: "var(--slate)", display: "block", marginBottom: 4 }}>Source *</label>
            <select
              className="select"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              required
            >
              <option value="">Select source</option>
              <option value="internal">Internal</option>
              <option value="government">Government</option>
              <option value="sebi">SEBI</option>
              <option value="rbi">RBI</option>
              <option value="court">Court Order</option>
              <option value="media">Media Report</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: "0.8rem", color: "var(--slate)", display: "block", marginBottom: 4 }}>Reason</label>
            <input
              className="input"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Reason for blacklisting"
            />
          </div>
          <button className="btn btn-primary" disabled={submitting} style={{ height: 38 }}>
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner message="Loading blacklist screening..." />}
      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState icon="🚫" title="No Blacklist Matches" description="No vendors match any blacklist criteria" />
      )}

      {data && data.length > 0 && (
        <div className="card" style={{ padding: "1.25rem" }}>
          <DataTable
            data={data}
            columns={[
              {
                key: "vendor_name",
                label: "Vendor",
                render: (_: any, row: any) => (
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--navy)" }}>{row.vendor_code}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{row.vendor_name}</div>
                  </div>
                ),
              },
              {
                key: "matched_field",
                label: "Matched Field",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)" }}>{val || "—"}</span>
                ),
              },
              {
                key: "matched_value",
                label: "Matched Value",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", fontFamily: "monospace", color: "var(--slate)" }}>{val || "—"}</span>
                ),
              },
              {
                key: "blacklist_source",
                label: "Source",
                render: (val: any) => <Badge value={val || "internal"} />,
              },
              {
                key: "reason",
                label: "Reason",
                render: (val: any) => (
                  <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>{val || "—"}</span>
                ),
              },
            ]}
            searchKeys={["vendor_name", "vendor_code", "matched_field", "matched_value", "reason"]}
            searchPlaceholder="Search by vendor, field or reason..."
          />
        </div>
      )}
    </div>
  );
}
