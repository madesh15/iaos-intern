interface BadgeProps { value: string; variant?: "default" | "success" | "danger" | "warning" | "gold" | "slate"; }

const V: Record<string, React.CSSProperties> = {
  default: { background: "var(--navy-tint)", color: "var(--navy)" },
  success: { background: "#dcfce7", color: "#166534" },
  danger: { background: "#fee2e2", color: "#991b1b" },
  warning: { background: "#fef3c7", color: "#92400e" },
  gold: { background: "var(--gold-tint)", color: "var(--gold-strong)" },
  slate: { background: "var(--line-soft)", color: "var(--slate)" },
};

function resolve(v: string): string {
  const l = v.toLowerCase();
  if (["active", "approved", "verified", "completed", "posted", "resolved", "closed"].includes(l)) return "success";
  if (["inactive", "rejected", "blocked", "cancelled", "reversed"].includes(l)) return "danger";
  if (["pending", "open", "in_review", "in_progress", "draft", "delayed"].includes(l)) return "warning";
  if (["critical", "high"].includes(l)) return "danger";
  if (["medium"].includes(l)) return "warning";
  if (["low"].includes(l)) return "slate";
  return "default";
}

export default function Badge({ value, variant }: BadgeProps) {
  const v = variant || resolve(value);
  return <span style={{ ...V[v] || V.default, display: "inline-block", padding: "0.15rem 0.55rem", borderRadius: "var(--radius-sm)", fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" as const }}>{value}</span>;
}
