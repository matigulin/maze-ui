type LogoProps = {
  size?: number;
  variant?: "full" | "icon";
  tone?: "color" | "white" | "black";
  className?: string;
};

/**
 * MAZE logo — recreated geometry.
 * Mark: three nested chevron "labyrinth" paths.
 * Wordmark: lowercase geometric "maze" with per-letter gradient.
 */
export function Logo({ size = 40, variant = "full", tone = "color", className = "" }: LogoProps) {
  const h = size;
  if (variant === "icon") {
    return <Mark height={h} tone={tone} className={className} />;
  }
  return (
    <span
      className={`inline-flex items-center gap-[0.4em] ${className}`}
      style={{ height: h }}
      aria-label="MAZE"
    >
      <Mark height={h} tone={tone} />
      <Wordmark height={h * 0.78} tone={tone} />
    </span>
  );
}

function Mark({ height, tone, className = "" }: { height: number; tone: LogoProps["tone"]; className?: string }) {
  const stroke =
    tone === "white" ? "#ffffff" : tone === "black" ? "#000000" : "url(#mz-mark)";
  const w = height * 1.05;
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 64 60"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mz-mark" cx="50%" cy="60%" r="65%">
          <stop offset="0%" stopColor="#1cb5e0" />
          <stop offset="50%" stopColor="#065287" />
          <stop offset="100%" stopColor="#000046" />
        </radialGradient>
      </defs>
      {/* Outer chevron */}
      <path
        d="M4 56 L32 6 L60 56"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Middle chevron */}
      <path
        d="M16 56 L32 27 L48 56"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner chevron */}
      <path
        d="M26 56 L32 45 L38 56"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Wordmark({ height, tone }: { height: number; tone: LogoProps["tone"] }) {
  const color =
    tone === "white" ? "text-white" : tone === "black" ? "text-black" : "maze-wordmark-gradient";
  return (
    <span
      className={`font-display font-bold leading-none tracking-[-0.04em] ${color}`}
      style={{ fontSize: height, letterSpacing: "0.02em" }}
    >
      maze
    </span>
  );
}
