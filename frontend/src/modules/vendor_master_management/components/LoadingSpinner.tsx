interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--slate)" }}>
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid var(--line)",
          borderTopColor: "var(--gold)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 0.75rem",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: "0.85rem" }}>{message}</div>
    </div>
  );
}
