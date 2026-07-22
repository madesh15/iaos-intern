import React from "react";
import { useFetch } from "../hooks/useData";
import { r2rApi } from "../services/api";
import { KPICard, BarChart, PieChart, LoadingSpinner, EmptyState } from "../components";

function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function DashboardPage() {
  const { data, loading, error } = useFetch(() => r2rApi.dashboard(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState icon="⚠️" title="Failed to load dashboard" description={error} />;
  if (!data) return <EmptyState title="No dashboard data" />;

  const s = data.stats;

  const kpis = [
    { title: "Total Journals", value: formatNum(s.total_journals), icon: "📒", color: "var(--gold)" },
    { title: "High Risk", value: formatNum(s.high_risk), icon: "🔴", color: "#ef4444" },
    { title: "Medium Risk", value: formatNum(s.medium_risk), icon: "⚠️", color: "#f59e0b" },
    { title: "Low Risk", value: formatNum(s.low_risk), icon: "✅", color: "#22c55e" },
    { title: "Open Findings", value: formatNum(s.open_findings), icon: "📋", color: "#f59e0b" },
    { title: "Open CAPA", value: formatNum(s.open_capa), icon: "⏳", color: "#f59e0b" },
    { title: "Open Reconciliation", value: formatNum(s.open_reconciliation), icon: "🔄", color: "#ef4444" },
    { title: "Suspense Balance", value: formatCurrency(s.suspense_balance), icon: "💰", color: "#ef4444" },
  ];

  const RISK_COLORS: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e",
  };

  const riskPieData = data.risk_distribution.map((d) => ({
    label: d.level,
    value: d.count,
    color: RISK_COLORS[d.level.toLowerCase()] || "#6b7280",
  }));

  const riskTrendBarData = data.risk_trend.map((d) => ({ label: d.month.slice(5), value: d.count }));
  const monthlyBarData = data.monthly_trend.map((d) => ({ label: d.month.slice(5), value: d.count }));
  const amountBarData = data.amount_histogram.map((d) => ({ label: d.bucket, value: d.count }));
  const topUsersBarData = data.top_users.map((d) => ({
    label: d.user_name.length > 12 ? d.user_name.slice(0, 12) + "…" : d.user_name,
    value: d.count,
  }));
  const topAccountsBarData = data.top_accounts.map((d) => ({
    label: d.account_name
      ? d.account_name.length > 12
        ? d.account_name.slice(0, 12) + "…"
        : d.account_name
      : d.account_code,
    value: d.count,
  }));
  const exceptionBarData = data.exception_trend.map((d) => ({ label: d.month.slice(5), value: d.count }));

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>
        R2R Dashboard
      </h2>
      <p style={{ color: "var(--slate)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
        Real-time overview of journal entry risk, reconciliation status and audit findings
      </p>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {kpis.map((k, i) => (
          <KPICard key={i} title={k.title} value={k.value} icon={k.icon} color={k.color} />
        ))}
      </div>

      {/* Row 1: Risk Distribution + Risk Trend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <PieChart data={riskPieData} title="Risk Distribution" />
        <BarChart data={riskTrendBarData} title="Risk Trend" color="#ef4444" />
      </div>

      {/* Row 2: Monthly Trend + Amount Histogram */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <BarChart data={monthlyBarData} title="Monthly Trend" color="var(--gold)" />
        <BarChart data={amountBarData} title="Amount Histogram" color="#8b5cf6" />
      </div>

      {/* Row 3: Top Users + Top Accounts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <BarChart data={topUsersBarData} title="Top Users" color="#0d3b66" />
        <BarChart data={topAccountsBarData} title="Top Accounts" color="#6b7280" />
      </div>

      {/* Row 4: Exception Trend */}
      <div style={{ marginBottom: "1.25rem" }}>
        <BarChart data={exceptionBarData} title="Exception Trend" color="#f59e0b" />
      </div>
    </div>
  );
}
