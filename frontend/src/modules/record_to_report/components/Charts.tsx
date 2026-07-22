interface BarChartProps { data: { label: string; value: number }[]; title?: string; height?: number; color?: string; }
export default function BarChart({ data, title, height = 220, color = "var(--gold)" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      {title && <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--navy)" }}>{title}</div>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.35rem", height, padding: "0 0.25rem" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: "0.65rem", color: "var(--slate)" }}>{d.value}</span>
            <div style={{ width: "100%", maxWidth: 48, height: `${(d.value / max) * (height - 40)}px`, background: color, borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", minHeight: d.value > 0 ? 4 : 0 }} />
            <span style={{ fontSize: "0.6rem", color: "var(--slate)", textAlign: "center", lineHeight: 1.1 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PieChartProps { data: { label: string; value: number; color: string }[]; title?: string; size?: number; }
export function PieChart({ data, title, size = 160 }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const segs = data.map((d) => { const pct = (d.value / total) * 100; const start = acc; acc += pct; return { ...d, start, pct }; });
  const grad = segs.map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(", ");
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      {title && <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--navy)" }}>{title}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(${grad})`, flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ color: "var(--ink)" }}>{d.label}</span>
              <span style={{ color: "var(--slate)", marginLeft: "auto" }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
