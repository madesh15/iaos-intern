interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
}

export default function KPICard({ title, value, icon, color = "var(--gold)", subtitle }: KPICardProps) {
  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", minWidth: 200 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-sm)",
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.75rem", color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2 }}>{value}</div>
        {subtitle && <div style={{ fontSize: "0.75rem", color: "var(--slate-soft)", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}
