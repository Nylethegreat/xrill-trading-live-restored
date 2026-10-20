import { mulberry32 } from "./seeded";

// Alpine Lake: a turquoise glacier lake at first light — jagged peaks lit
// pink-orange by alpenglow with snow streaks, mirrored in still water,
// dark pine forest on the shores, boulders and tall pines in the
// foreground. Original SVG. Water shimmer drifts via .xr-lake-shimmer,
// still under reduced motion.
const W = 1600, H = 1000;
const SHORE = 560; // waterline
const r = mulberry32(3301);

// main ridge (peaks), as points above the waterline
const RIDGE: [number, number][] = [
  [0, 210], [90, 150], [170, 230], [240, 120], [300, 170], [360, 90], [430, 160], [500, 110], [560, 180],
  [640, 120], [700, 80], [760, 140], [830, 100], [900, 170], [960, 130], [1040, 190], [1120, 230], [1200, 260],
  [1280, 300], [1360, 330], [1450, 360], [1600, 380],
];
const ridgePath = (flip: boolean) => {
  const y = (v: number) => (flip ? 2 * SHORE - v : v);
  const pts = RIDGE.map(([x, v]) => `${x} ${y(v)}`).join(" L");
  return `M0 ${y(SHORE)} L${pts} L1600 ${y(SHORE)}Z`;
};
// snow streaks running down from each peak
const SNOW = RIDGE.filter((_, i) => i % 2 === 1 && i < 16).map(([x, y]) => ({ x, y, len: 60 + r() * 120, dx: -20 + r() * 40 }));

const pine = (x: number, base: number, h: number) => {
  const w = h * 0.32;
  let d = "";
  for (let k = 0; k < 4; k++) {
    const t = base - k * h * 0.22;
    const ww = w * (1 - k * 0.2);
    d += `M${x - ww / 2} ${t} L${x} ${t - h * 0.42} L${x + ww / 2} ${t}Z `;
  }
  return d;
};
const FAR_TREES = Array.from({ length: 120 }, (_, i) => ({ x: 900 + i * 6 + r() * 4, h: 26 + r() * 22 }));
const LEFT_TREES = Array.from({ length: 40 }, (_, i) => ({ x: 380 + i * 9 + r() * 5, h: 24 + r() * 28 }));
const NEAR = [
  { x: 70, h: 640 }, { x: 180, h: 520 }, { x: 430, h: 380 }, { x: 520, h: 300 }, { x: 680, h: 360 },
  { x: 1180, h: 340 }, { x: 1330, h: 460 }, { x: 1460, h: 600 }, { x: 1560, h: 520 },
];
const SHIMMER = Array.from({ length: 28 }, () => ({ x: 120 + r() * 1300, y: SHORE + 30 + r() * 300, w: 40 + r() * 140 }));

export default function AlpineLakeTexture({ className = "", idPrefix = "alpine" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7aa7d9" />
          <stop offset="60%" stopColor="#c9dcef" />
          <stop offset="100%" stopColor="#f3e2d4" />
        </linearGradient>
        <linearGradient id={`${p}-rock`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9a27a" />
          <stop offset="45%" stopColor="#c47b5e" />
          <stop offset="100%" stopColor="#6c5a60" />
        </linearGradient>
        <linearGradient id={`${p}-lake`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3fb3d6" />
          <stop offset="55%" stopColor="#2a8fbf" />
          <stop offset="100%" stopColor="#1b5f86" />
        </linearGradient>
        <linearGradient id={`${p}-refl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        <mask id={`${p}-fade`}>
          <rect x="0" y={SHORE} width={W} height={H - SHORE} fill={`url(#${p}-refl)`} />
        </mask>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-sky)`} />

      {/* peaks + snow */}
      <path d={ridgePath(false)} fill={`url(#${p}-rock)`} />
      <path d={ridgePath(false)} fill="#3b2f3a" opacity="0.18" transform="translate(30 30)" />
      <g stroke="#fbf5ef" strokeLinecap="round" opacity="0.85">
        {SNOW.map((s, i) => (
          <path key={i} d={`M${s.x} ${s.y + 8} q${s.dx} ${s.len * 0.5} ${s.dx * 0.4} ${s.len}`} strokeWidth={4 + (i % 3) * 2} fill="none" />
        ))}
      </g>
      {/* left cliff */}
      <path d="M0 120 L120 140 L220 300 L320 420 L380 520 L0 560Z" fill="#7d6f72" />
      <path d="M0 120 L120 140 L200 280 L60 300Z" fill="#9b8a86" opacity="0.7" />
      {/* scree slope */}
      <path d="M180 420 L330 380 L460 560 L220 560Z" fill="#b8b2ac" />

      {/* forested shores */}
      <path d="M860 520 L1600 470 L1600 565 L860 565Z" fill="#1d3b2c" />
      <path d={FAR_TREES.map((t) => pine(t.x, 540 - (t.x - 900) * 0.07, t.h)).join("")} fill="#183326" />
      <path d={LEFT_TREES.map((t) => pine(t.x, 560, t.h)).join("")} fill="#1c3a2a" />

      {/* lake + mirrored mountains */}
      <rect x="0" y={SHORE} width={W} height={H - SHORE} fill={`url(#${p}-lake)`} />
      <g mask={`url(#${p}-fade)`}>
        <path d={ridgePath(true)} fill={`url(#${p}-rock)`} opacity="0.9" />
      </g>
      <rect x="0" y={SHORE} width={W} height={H - SHORE} fill="#2bb5d8" opacity="0.35" />
      <g className="xr-lake-shimmer" stroke="#e0f7ff" strokeWidth="2" strokeLinecap="round" opacity="0.5">
        {SHIMMER.map((s, i) => <line key={i} x1={s.x} y1={s.y} x2={s.x + s.w} y2={s.y} />)}
      </g>

      {/* foreground rocks */}
      <path d="M0 900 Q200 840 420 870 Q620 860 820 900 Q1100 880 1300 910 Q1450 890 1600 920 L1600 1000 L0 1000Z" fill="#8c8a86" />
      <path d="M0 940 Q260 900 520 930 Q800 950 1100 930 Q1350 920 1600 950 L1600 1000 L0 1000Z" fill="#5f5d5a" />
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx={60 + i * 115 + (i % 3) * 20} cy={925 + (i % 4) * 14} rx={40 + (i % 3) * 18} ry={18 + (i % 2) * 8} fill={i % 2 ? "#a3a19c" : "#73716c"} />
      ))}

      {/* tall foreground pines */}
      <path d={NEAR.map((t) => pine(t.x, 960, t.h)).join("")} fill="#0f2a1c" />
      <g stroke="#0b1f15" strokeWidth="6">
        {NEAR.map((t, i) => <line key={i} x1={t.x} y1={960} x2={t.x} y2={960 - t.h * 0.9} />)}
      </g>
    </svg>
  );
}
