/** Cap Corporate / IAOS wordmark with a shield-check glyph. */
export function Logo({
  size = 32,
  light = false,
  fullText = true,
}: {
  size?: number;
  light?: boolean;
  fullText?: boolean;
}) {
  const textColor = light ? "#ffffff" : "var(--navy)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        style={{ flexShrink: 0 }}
      >
        {/* Hexagonal Shield Background */}
        <polygon
          points="20,2 38,10 38,30 20,38 2,30 2,10"
          fill="var(--navy)"
        />
        {/* Inner Highlight Polygon */}
        <polygon
          points="20,5 34,12 34,28 20,35 6,28 6,12"
          fill="#11294a"
        />
        {/* Golden Audit Checkmark */}
        <path
          d="M13 20l5 5 9-10"
          stroke="var(--gold)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small Tech Dots */}
        <circle cx="20" cy="9" r="1.5" fill="var(--gold)" />
        <circle cx="9" cy="27" r="1" fill="#fff" opacity="0.5" />
        <circle cx="31" cy="27" r="1" fill="#fff" opacity="0.5" />
      </svg>
      {fullText && (
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.15,
            textAlign: "left",
          }}
        >
          <strong
            style={{
              fontSize: size * 0.52,
              letterSpacing: "0.05em",
              color: textColor,
              fontWeight: 800,
            }}
          >
            CAP-AI
          </strong>
          <span
            style={{
              fontSize: size * 0.25,
              color: light ? "rgba(255,255,255,.85)" : "var(--slate-soft)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              maxWidth: "180px",
              whiteSpace: "normal",
            }}
          >
            Forex & Hedging Exposure Management System
          </span>
        </span>
      )}
    </span>
  );
}

