// Decorative "digital trading terminal" artwork: a glowing candlestick
// series over a faint data grid, in the mood of a dark quant-desk monitor.
// Pure inline SVG (no external images/network) so it stays fast, themeable
// with the app's existing tokens, and safe to drop in anywhere. Three sizes
// cover every placement this app needs:
//   - "backdrop": full-bleed, ultra-low-opacity, fixed behind every page
//   - "hero":     bigger and brighter, for the landing page
//   - "banner":   a compact strip behind a page header (dashboard, analytics, intelligence)

type Variant = "backdrop" | "hero" | "banner";

// A hand-placed OHLC series — up/down bars of varying height, styled like a
// real candlestick chart. Deterministic (no Math.random) so server and
// client render identically and nothing "pops" after hydration.
const CANDLES: { x: number; open: number; close: number; high: number; low: number }[] = [
  { x: 0, open: 58, close: 46, high: 62, low: 42 },
  { x: 1, open: 46, close: 52, high: 50, low: 40 },
  { x: 2, open: 52, close: 38, high: 55, low: 34 },
  { x: 3, open: 38, close: 44, high: 46, low: 30 },
  { x: 4, open: 44, close: 30, high: 48, low: 26 },
  { x: 5, open: 30, close: 36, high: 38, low: 22 },
  { x: 6, open: 36, close: 20, high: 40, low: 16 },
  { x: 7, open: 20, close: 28, high: 32, low: 14 },
  { x: 8, open: 28, close: 14, high: 30, low: 10 },
  { x: 9, open: 14, close: 24, high: 26, low: 8 },
  { x: 10, open: 24, close: 12, high: 28, low: 6 },
  { x: 11, open: 12, close: 22, high: 24, low: 4 },
  { x: 12, open: 22, close: 8, high: 26, low: 2 },
  { x: 13, open: 8, close: 18, high: 20, low: 2 },
  { x: 14, open: 18, close: 6, high: 22, low: 0 },
];

const SIZE: Record<Variant, { width: number; height: number; step: number; strokeW: number; wickW: number }> = {
  backdrop: { width: 1200, height: 480, step: 80, strokeW: 10, wickW: 3 },
  hero: { width: 900, height: 420, step: 60, strokeW: 12, wickW: 3.5 },
  banner: { width: 900, height: 220, step: 60, strokeW: 8, wickW: 2.5 },
};

export default function CandlestickGlow({
  variant = "backdrop",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const { width, height, step, strokeW, wickW } = SIZE[variant];
  const scaleY = (height - 40) / 70;
  const y = (v: number) => 20 + v * scaleY;

  const gridLines = 8;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`glowUp-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id={`glowDown-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <radialGradient id={`vignette-${variant}`} cx="30%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#3b82f6" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#07080f" stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${variant}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={variant === "backdrop" ? 6 : 4} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={width} height={height} fill={`url(#vignette-${variant})`} />

      {/* faint graph-paper grid */}
      <g stroke="#22d3ee" strokeOpacity="0.08" strokeWidth="1">
        {Array.from({ length: gridLines }).map((_, i) => (
          <line key={`h-${i}`} x1={0} y1={(height / gridLines) * i} x2={width} y2={(height / gridLines) * i} />
        ))}
        {Array.from({ length: Math.ceil(width / step) }).map((_, i) => (
          <line key={`v-${i}`} x1={i * step} y1={0} x2={i * step} y2={height} />
        ))}
      </g>

      {/* candlesticks — the whole series drifts a few px side to side, and
          each bar breathes (opacity + scaleY) on its own staggered delay so
          the pulse rolls down the line rather than blinking in unison */}
      <g filter={`url(#glow-${variant})`} className="animate-candle-drift">
        {CANDLES.map((c, i) => {
          const cx = 40 + c.x * step;
          const up = c.close < c.open; // svg y grows downward; "up" candle = close higher = smaller y
          const bodyTop = y(Math.min(c.open, c.close));
          const bodyBottom = y(Math.max(c.open, c.close));
          const fill = up ? `url(#glowUp-${variant})` : `url(#glowDown-${variant})`;
          if (cx > width + 40) return null;
          return (
            <g
              key={c.x}
              className="animate-candle-pulse"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animationDelay: `${i * 180}ms`,
              }}
            >
              <line x1={cx} y1={y(c.high)} x2={cx} y2={y(c.low)} stroke={fill} strokeWidth={wickW} strokeLinecap="round" />
              <rect
                x={cx - strokeW / 2}
                y={bodyTop}
                width={strokeW}
                height={Math.max(2, bodyBottom - bodyTop)}
                rx={2}
                fill={fill}
              />
            </g>
          );
        })}
      </g>

      {/* ticker readout, top-right */}
      <g fontFamily="ui-monospace, SFMono-Regular, monospace" fill="#5eead4" fillOpacity="0.35">
        <text x={width - 20} y={28} textAnchor="end" fontSize={variant === "hero" ? 20 : 14} letterSpacing="2">
          XRILL // LIVE
        </text>
      </g>
    </svg>
  );
}
