interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      marginBottom: 20, flexWrap: "wrap", gap: 12,
    }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>{title}</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--slate)", maxWidth: 600 }}>{description}</p>
      </div>
      {children && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>}
    </div>
  );
}
