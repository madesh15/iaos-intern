import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface MatchRow {
  shipment_id: number; shipment_number: string; lr_number: string;
  pod_number: string; invoice_number: string; is_matched: boolean; mismatch_details: string;
}

export default function LRPODMatchPage() {
  const [data, setData] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<MatchRow[]>(`/api/modules/${SLUG}/analytics/lr-pod-match`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const matched = data.filter((r) => r.is_matched).length;
  const mismatched = data.filter((r) => !r.is_matched).length;

  return (
    <div>
      <PageHeader title="Lorry Receipt / POD Match"
        description="Compare Lorry Receipts (LR), Proofs of Delivery (POD), and invoices to highlight mismatches and documentation gaps." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Checked" value={data.length} color="var(--navy)" />
        <StatCard label="Matched" value={matched} color="#059669" />
        <StatCard label="Mismatched" value={mismatched} color="#dc2626" />
        <StatCard label="Match Rate" value={data.length ? `${((matched / data.length) * 100).toFixed(1)}%` : "0%"} color="#0891b2" />
      </div>

      <DataTable
        columns={[
          { key: "shipment_number", label: "Shipment#" },
          { key: "lr_number", label: "LR#" },
          { key: "pod_number", label: "POD#", render: (r) => r.pod_number || "—" },
          { key: "invoice_number", label: "Invoice#" },
          { key: "is_matched", label: "Status", render: (r) => (
            <span className={`badge ${r.is_matched ? "badge-success" : "badge-danger"}`}>
              {r.is_matched ? "Matched" : "Mismatch"}
            </span>
          )},
          { key: "mismatch_details", label: "Details", render: (r) => (
            <span style={{ fontSize: 12, color: r.is_matched ? "var(--slate)" : "var(--danger)" }}>
              {r.mismatch_details}
            </span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No LR/POD data available."
      />
    </div>
  );
}
