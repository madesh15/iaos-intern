import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";

const COLORS = ["#2563eb", "#059669", "#dc2626", "#ca8a04", "#7c3aed", "#0891b2", "#ea580c"];

interface ChartProps {
  data: any[];
  height?: number;
}

export function BarChartComponent({ data, height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return <EmptyChart />;
  }
  const keys = Object.keys(data[0]).filter((k) => typeof data[0][k] === "number" && k !== "id");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={Object.keys(data[0]).find((k) => typeof data[0][k] === "string") || "name"}
          tick={{ fontSize: 12 }} stroke="var(--slate)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--slate)" />
        <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 6 }} />
        {keys.slice(0, 3).map((key, i) => (
          <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieChartComponent({ data, height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return <EmptyChart />;
  }
  const nameKey = Object.keys(data[0]).find((k) => typeof data[0][k] === "string") || "name";
  const valueKey = Object.keys(data[0]).find((k) => typeof data[0][k] === "number") || "value";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={100}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 6 }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function LineChartComponent({ data, height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return <EmptyChart />;
  }
  const keys = Object.keys(data[0]).filter((k) => typeof data[0][k] === "number" && k !== "id");
  const nameKey = Object.keys(data[0]).find((k) => typeof data[0][k] === "string") || "name";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} stroke="var(--slate)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--slate)" />
        <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 6 }} />
        <Legend />
        {keys.slice(0, 3).map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]}
            strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaChartComponent({ data, height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return <EmptyChart />;
  }
  const keys = Object.keys(data[0]).filter((k) => typeof data[0][k] === "number" && k !== "id");
  const nameKey = Object.keys(data[0]).find((k) => typeof data[0][k] === "string") || "name";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} stroke="var(--slate)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--slate)" />
        <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 6 }} />
        <Legend />
        {keys.slice(0, 2).map((key, i) => (
          <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]} fillOpacity={0.1} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RiskHeatmap({ data, height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return <EmptyChart />;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
      {data.map((item, i) => {
        const score = item.score || item.value || 0;
        const color = score > 70 ? "#dc2626" : score > 40 ? "#ca8a04" : "#059669";
        return (
          <div key={i} style={{
            padding: 12, borderRadius: 8, background: `${color}15`,
            border: `1px solid ${color}30`, textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: "var(--slate)", marginBottom: 4 }}>
              {item.name || item.category || item.risk_code || ""}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{score}{typeof score === "number" ? "" : ""}</div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--slate)", fontSize: 13 }}>
      No data available
    </div>
  );
}
