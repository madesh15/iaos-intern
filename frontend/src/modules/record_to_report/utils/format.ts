export function formatCurrency(amount: number): string {
  if (amount < 0) return `-₹${Math.abs(amount).toLocaleString("en-IN")}`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function riskColor(level: string): string {
  switch (level.toLowerCase()) {
    case "critical": return "#991b1b";
    case "high": return "#ef4444";
    case "medium": return "#f59e0b";
    case "low": return "#22c55e";
    default: return "#6b7280";
  }
}
