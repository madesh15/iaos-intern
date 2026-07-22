import React from "react";
import { useFetch } from "../hooks/useData";
import { vendorApi } from "../services/api";
import { KPICard, BarChart, PieChart, LoadingSpinner, EmptyState } from "../components";

const COLORS = ["#0d3b66", "#d4a843", "#6b7280", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];

function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}

export default function DashboardPage() {
  const { data, loading, error } = useFetch(() => vendorApi.dashboard(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load dashboard" description={error} />;
  if (!data) return <EmptyState title="No dashboard data" />;

  const s = data.stats;

  const kpis = [
    { title: "Total Vendors", value: formatNum(s.total_vendors), icon: "👥", color: "var(--gold)" },
    { title: "Active Vendors", value: formatNum(s.active_vendors), icon: "✅", color: "#22c55e" },
    { title: "Dormant Vendors", value: formatNum(s.dormant_vendors), icon: "💤", color: "var(--slate)" },
    { title: "Duplicate Vendors", value: formatNum(s.duplicate_vendors), icon: "⚠️", color: "#f59e0b" },
    { title: "Missing GST", value: formatNum(s.missing_gst), icon: "📄", color: "#ef4444" },
    { title: "Missing PAN", value: formatNum(s.missing_pan), icon: "📄", color: "#ef4444" },
    { title: "Pending KYC", value: formatNum(s.pending_kyc), icon: "🔐", color: "#f59e0b" },
    { title: "Duplicate Bank Accounts", value: formatNum(s.duplicate_bank_accounts), icon: "🏦", color: "#ef4444" },
    { title: "High Risk Vendors", value: formatNum(s.high_risk_vendors), icon: "🔴", color: "#ef4444" },
    { title: "Vendor Concentration %", value: `${s.vendor_concentration_pct}%`, icon: "📊", color: "var(--gold)" },
    { title: "Open Findings", value: formatNum(s.open_findings), icon: "📋", color: "#f59e0b" },
    { title: "CAPA Pending", value: formatNum(s.capa_pending), icon: "⏳", color: "#f59e0b" },
  ];

  const statusPieData = data.vendor_status.map((d, i) => ({
    label: d.status,
    value: d.count,
    color: COLORS[i % COLORS.length],
  }));

  const catPieData = data.vendor_category.map((d, i) => ({
    label: d.category,
    value: d.count,
    color: COLORS[i % COLORS.length],
  }));

  const riskBarData = data.risk_distribution.map((d) => ({ label: d.level, value: d.count }));
  const monthlyBarData = data.monthly_creation.map((d) => ({ label: d.month.slice(5), value: d.count }));
  const bankBarData = data.bank_change_trend.map((d) => ({ label: d.month.slice(5), value: d.count }));
  const spendBarData = data.top_vendors_by_spend.map((d) => ({
    label: d.vendor_name.length > 12 ? d.vendor_name.slice(0, 12) + "…" : d.vendor_name,
    value: d.spend_amount,
  }));
  const exceptionBarData = data.exception_trend.map((d) => ({ label: d.month.slice(5), value: d.count }));

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>
        Vendor Master Dashboard
      </h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
        Real-time overview of vendor master data quality and audit risk indicators
      </p>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {kpis.map((k, i) => (
          <KPICard key={i} title={k.title} value={k.value} icon={k.icon} color={k.color} />
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <PieChart data={statusPieData} title="Vendor Status" />
        <PieChart data={catPieData} title="Vendor Category" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <BarChart data={riskBarData} title="Risk Distribution" color="#ef4444" />
        <BarChart data={monthlyBarData} title="Monthly Vendor Creation" color="var(--gold)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <BarChart data={bankBarData} title="Bank Detail Changes" color="#8b5cf6" />
        <BarChart data={spendBarData} title="Top Vendors by Spend" color="#0d3b66" />
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <BarChart data={exceptionBarData} title="Exception Trend" color="#f59e0b" />
      </div>
    </div>
  );
}
