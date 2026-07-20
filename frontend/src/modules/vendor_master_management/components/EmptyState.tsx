interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = "📋", title, description }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--slate)" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--navy)", marginBottom: "0.25rem" }}>{title}</div>
      {description && <div style={{ fontSize: "0.85rem" }}>{description}</div>}
    </div>
  );
}
