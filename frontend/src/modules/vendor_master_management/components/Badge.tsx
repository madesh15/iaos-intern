interface BadgeProps {
  value: string;
  variant?: "default" | "success" | "danger" | "warning" | "gold" | "slate";
  size?: "sm" | "md";
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: { background: "var(--navy-tint)", color: "var(--navy)" },
  success: { background: "#dcfce7", color: "#166534" },
  danger: { background: "#fee2e2", color: "#991b1b" },
  warning: { background: "#fef3c7", color: "#92400e" },
  gold: { background: "var(--gold-tint)", color: "var(--gold-strong)" },
  slate: { background: "var(--line-soft)", color: "var(--slate)" },
};

function resolveVariant(value: string): string {
  const v = value.toLowerCase();
  if (["active", "approved", "verified", "compliant", "valid"].includes(v)) return "success";
  if (["inactive", "rejected", "blocked", "expired", "invalid", "non_compliant"].includes(v)) return "danger";
  if (["pending", "under_review", "in_progress"].includes(v)) return "warning";
  if (["critical", "high"].includes(v)) return "danger";
  if (["medium"].includes(v)) return "warning";
  if (["low", "dormant"].includes(v)) return "slate";
  return "default";
}

export default function Badge({ value, variant, size = "sm" }: BadgeProps) {
  const v = variant || resolveVariant(value);
  const style: React.CSSProperties = {
    ...variantStyles[v] || variantStyles.default,
    display: "inline-block",
    padding: size === "sm" ? "0.15rem 0.55rem" : "0.25rem 0.75rem",
    borderRadius: "var(--radius-sm)",
    fontSize: size === "sm" ? "0.72rem" : "0.8rem",
    fontWeight: 600,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  };
  return <span style={style}>{value}</span>;
}
