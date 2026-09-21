// Decorative "market pulse" visual for the Analytics page header — a
// wavy line over faint bars, with a few glowing nodes that pulse on a
// staggered delay (reuses the candle-pulse keyframe from
// tailwind.config.ts). Purely aria-hidden/pointer-events-none.
const NODES = [
  { cx: 20, cy: 60, delay: "0s" },
  { cx: 70, cy: 35, delay: "0.4s" },
  { cx: 120, cy: 50, delay: "0.8s" },
  { cx: 170, cy: 22, delay: "1.2s" },
  { cx: 220, cy: 45, delay: "0.6s" },
];

export default function PulseChart({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 240 90" className="h-full w-full overflow-visible">
        {/* faint background bars */}
        {[10, 45, 80, 115, 150, 185, 220].map((x, i) => (
          <rect
            key={x}
            x={x}
            y={90 - 20 - (i % 3) * 12}
            width="8"
            height={20 + (i % 3) * 12}
            rx="2"
            fill="#3b82f6"
            opacity="0.15"
          />
        ))}
        {/* the line */}
        <polyline
          points={NODES.map((n) => `${n.cx},${n.cy}`).join(" ")}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="1.5"
          opacity="0.7"
        />
        {/* pulsing nodes */}
        {NODES.map((n) => (
          <circle
            key={n.cx}
            cx={n.cx}
            cy={n.cy}
            r="4"
            fill="#93c5fd"
            className="motion-safe:animate-candle-pulse"
            style={{ animationDelay: n.delay, transformOrigin: `${n.cx}px ${n.cy}px` }}
          />
        ))}
      </svg>
    </div>
  );
}
