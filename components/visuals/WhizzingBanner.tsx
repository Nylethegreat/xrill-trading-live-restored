// "Ultra banner" behind the Playbook's star-field toggle -- white/cyan
// speed-line streaks radiating past a bright flash core, like a
// hyperspace-jump burst. Pure inline SVG, deterministic geometry (no
// Math.random). Streaks drift slowly via the existing candle-drift-style
// motion plus a per-line staggered opacity pulse so the burst reads as
// "live" rather than a static starburst graphic.
const STREAKS = [
  { angle: -55, length: 340, width: 3, delay: "0s" },
  { angle: -38, length: 420, width: 2, delay: "0.15s" },
  { angle: -22, length: 300, width: 4, delay: "0.3s" },
  { angle: -8, length: 460, width: 2.5, delay: "0.45s" },
  { angle: 6, length: 380, width: 3, delay: "0.6s" },
  { angle: 20, length: 440, width: 2, delay: "0.75s" },
  { angle: 34, length: 320, width: 3.5, delay: "0.9s" },
  { angle: 50, length: 400, width: 2, delay: "1.05s" },
  { angle: -70, length: 260, width: 2, delay: "1.2s" },
  { angle: 68, length: 280, width: 2.5, delay: "1.35s" },
];

export default function WhizzingBanner({ className = "" }: { className?: string }) {
  const cx = 450;
  const cy = 90;

  return (
    <svg viewBox="0 0 900 180" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="whizFlash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#67e8f9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="whizStreak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0" />
          <stop offset="70%" stopColor="#a5f3fc" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>
        <filter id="whizGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r="90" fill="url(#whizFlash)" className="animate-exp-glow" />

      <g filter="url(#whizGlow)">
        {STREAKS.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180;
          const x2 = cx + Math.cos(rad) * s.length;
          const y2 = cy + Math.sin(rad) * s.length;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="url(#whizStreak)"
              strokeWidth={s.width}
              strokeLinecap="round"
              className="animate-neuron-flash"
              style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: s.delay }}
            />
          );
        })}
      </g>

      <circle cx={cx} cy={cy} r="8" fill="#f0f9ff" filter="url(#whizGlow)" className="animate-exp-glow" />
    </svg>
  );
}
