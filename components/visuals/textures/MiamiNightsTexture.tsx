import { mulberry32 } from "./seeded";
import { Palm } from "./palmShape";

// Miami Nights: Brickell from the riverwalk at blue hour — glassy towers
// stacked with warm lit windows, neon green and violet crowns, the
// skyline mirrored in the river in long colored streaks, a riverwalk
// railing and palms on the right. Original SVG; windows use one <pattern>
// per tone so the whole skyline stays cheap to render. Window glow and
// reflections shimmer via .xr-* classes, still under reduced motion.
const W = 1600, H = 1000;
const WATER = 680;
const r = mulberry32(5150);

type Tower = { x: number; w: number; top: number; tone: "warm" | "cool"; crown?: string };
const TOWERS: Tower[] = [
  { x: 60, w: 150, top: 120, tone: "warm", crown: "#4ade80" },
  { x: 230, w: 120, top: 260, tone: "cool" },
  { x: 350, w: 170, top: 210, tone: "warm" },
  { x: 540, w: 110, top: 300, tone: "cool" },
  { x: 650, w: 120, top: 150, tone: "warm", crown: "#a78bfa" },
  { x: 790, w: 90, top: 200, tone: "cool" },
  { x: 880, w: 140, top: 330, tone: "warm" },
  { x: 1030, w: 110, top: 240, tone: "warm", crown: "#f0abfc" },
  { x: 1150, w: 160, top: 360, tone: "cool" },
  { x: 1320, w: 120, top: 420, tone: "warm" },
];
const BACK = Array.from({ length: 22 }, (_, i) => ({ x: i * 75 + r() * 30, w: 50 + r() * 40, top: 340 + r() * 160 }));
const DARK = TOWERS.flatMap((t) =>
  Array.from({ length: 14 }, () => ({ x: t.x + 8 + Math.floor(r() * ((t.w - 20) / 14)) * 14, y: t.top + 30 + Math.floor(r() * ((WATER - t.top - 40) / 18)) * 18 })),
);

export default function MiamiNightsTexture({ className = "", idPrefix = "mnights" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1a4a" />
          <stop offset="60%" stopColor="#1d3c8f" />
          <stop offset="100%" stopColor="#3d63b8" />
        </linearGradient>
        <linearGradient id={`${p}-river`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2c5e" />
          <stop offset="100%" stopColor="#070d22" />
        </linearGradient>
        <pattern id={`${p}-warm`} width="14" height="18" patternUnits="userSpaceOnUse">
          <rect width="14" height="18" fill="#2a3346" />
          <rect x="2" y="3" width="10" height="11" fill="#ffd27a" />
        </pattern>
        <pattern id={`${p}-cool`} width="14" height="18" patternUnits="userSpaceOnUse">
          <rect width="14" height="18" fill="#26324a" />
          <rect x="2" y="3" width="10" height="11" fill="#f5f0e1" opacity="0.85" />
        </pattern>
        <pattern id={`${p}-back`} width="12" height="16" patternUnits="userSpaceOnUse">
          <rect width="12" height="16" fill="#1f2a48" />
          <rect x="3" y="4" width="6" height="7" fill="#ffcf8a" opacity="0.55" />
        </pattern>
        <linearGradient id={`${p}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${p}-reflmask`}>
          <rect x="0" y={WATER} width={W} height={H - WATER} fill={`url(#${p}-fade)`} />
        </mask>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-sky)`} />
      <circle cx="1450" cy="120" r="2" fill="#fff" opacity="0.8" />
      <circle cx="1180" cy="80" r="1.6" fill="#fff" opacity="0.6" />
      <circle cx="420" cy="60" r="1.6" fill="#fff" opacity="0.6" />

      {/* back layer */}
      {BACK.map((b, i) => <rect key={i} x={b.x} y={b.top} width={b.w} height={WATER - b.top} fill={`url(#${p}-back)`} opacity="0.8" />)}

      {/* main towers */}
      <g>
        {TOWERS.map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={t.top} width={t.w} height={WATER - t.top} fill={`url(#${p}-${t.tone})`} />
            <rect x={t.x} y={t.top} width={t.w * 0.18} height={WATER - t.top} fill="#0b1229" opacity="0.35" />
            {t.crown && (
              <g>
                <rect x={t.x - 4} y={t.top - 14} width={t.w + 8} height="14" fill={t.crown} className="xr-neon-hum" />
                <rect x={t.x - 4} y={t.top - 14} width={t.w + 8} height="14" fill={t.crown} opacity="0.35" transform={`translate(0 -6)`} />
                <rect x={t.x} y={t.top} width="6" height={WATER - t.top} fill={t.crown} opacity="0.7" />
              </g>
            )}
          </g>
        ))}
        {DARK.map((d, i) => <rect key={i} x={d.x} y={d.y} width="12" height="14" fill="#222b3e" opacity="0.9" />)}
      </g>
      {/* waterfront strip */}
      <rect x="0" y={WATER - 18} width={W} height="18" fill="#0f1a33" />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={20 + i * 52} cy={WATER - 10} r="2.5" fill="#fde68a" />
      ))}

      {/* river + mirrored skyline */}
      <rect x="0" y={WATER} width={W} height={H - WATER} fill={`url(#${p}-river)`} />
      <g mask={`url(#${p}-reflmask)`} opacity="0.75">
        <g transform={`translate(0 ${2 * WATER}) scale(1 -1)`}>
        {TOWERS.map((t, i) => (
          <rect key={i} x={t.x} y={t.top} width={t.w} height={WATER - t.top} fill={`url(#${p}-${t.tone})`} />
        ))}
        </g>
      </g>
      <g className="xr-lake-shimmer" strokeLinecap="round">
        {TOWERS.map((t, i) => (
          <g key={i}>
            {Array.from({ length: 6 }, (_, k) => (
              <line
                key={k}
                x1={t.x + 10 + ((k * 37) % (t.w - 20))}
                x2={t.x + 30 + ((k * 37) % (t.w - 20))}
                y1={WATER + 20 + k * 40}
                y2={WATER + 20 + k * 40}
                stroke={t.crown ?? "#ffd27a"}
                strokeWidth="3"
                opacity={0.7 - k * 0.09}
              />
            ))}
          </g>
        ))}
      </g>

      {/* riverwalk */}
      <path d="M1180 1000 L1600 760 L1600 1000Z" fill="#0d1428" />
      <path d="M1200 990 L1600 760" stroke="#c7d2fe" strokeWidth="3" opacity="0.6" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={1220 + i * 34} y1={980 - i * 19.5} x2={1220 + i * 34} y2={950 - i * 19.5} stroke="#c7d2fe" strokeWidth="2" opacity="0.5" />
      ))}
      <circle cx="1500" cy="700" r="40" fill="#fde68a" opacity="0.18" />
      <rect x="1497" y="700" width="5" height="120" fill="#94a3b8" />
      <circle cx="1500" cy="700" r="8" fill="#fef3c7" />

      {/* palms in blue-hour silhouette */}
      <Palm x={1420} baseY={1000} h={640} lean={-0.05} scale={1.1} trunk="#0b1222" frond="#0f1d2b" rib="#0b1626" i={0} />
      <Palm x={1560} baseY={1000} h={820} lean={-0.08} scale={1.3} trunk="#080e1a" frond="#0c1825" rib="#08111d" i={1} />
    </svg>
  );
}
