interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
}

export default function StatCard({ label, value, color = "var(--navy)", icon, size = "md" }: StatCardProps) {
  const fontSize = size === "lg" ? 28 : size === "sm" ? 18 : 22;
  return (
    <div className="card" style={{
      padding: size === "lg" ? "20px 24px" : size === "sm" ? "12px 14px" : "16px 18px",
      borderLeft: `4px solid ${color}`,
    }}>
      {icon && <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>}
      <div style={{ fontSize: 11, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
