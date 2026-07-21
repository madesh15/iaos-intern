import { useEffect, useState } from "react";
import { get } from "../../../../lib/api";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";

const SLUG = "logistics_freight";

interface DuplicateRow {
  id: number; invoice_number: string; shipment_number: string;
  lr_number: string; amount: number; match_reason: string;
}

export default function DuplicateBillingPage() {
  const [data, setData] = useState<DuplicateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<DuplicateRow[]>(`/api/modules/${SLUG}/analytics/duplicate-billing`)
      .then(setData).finally(() => setLoading(false));
  }, []);

  const totalAmount = data.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageHeader title="Duplicate Freight Billing"
        description="Identify duplicate invoices by matching invoice numbers, shipment numbers, LR numbers, and billed amounts.">
        <span className="badge badge-danger" style={{ fontSize: 12 }}>{data.length} duplicates</span>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Duplicate Incidents" value={data.length} color="#dc2626" />
        <StatCard label="Total Duplicate Amount" value={`₹${totalAmount.toLocaleString()}`} color="#dc2626" />
      </div>

      <DataTable
        columns={[
          { key: "invoice_number", label: "Invoice#" },
          { key: "shipment_number", label: "Shipment#" },
          { key: "lr_number", label: "LR#" },
          { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString()}` },
          { key: "match_reason", label: "Match Reason", render: (r) => (
            <span className="badge badge-danger">{r.match_reason}</span>
          )},
        ]}
        data={data}
        loading={loading}
        emptyMessage="No duplicate billing detected."
      />
    </div>
  );
}
