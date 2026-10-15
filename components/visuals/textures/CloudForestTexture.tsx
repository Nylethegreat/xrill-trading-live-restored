import { mulberry32 } from "./seeded";

// Cloud Forest: looking down on a misty high-altitude canopy at golden
// hour — rolling layers of deep-teal treetops, warm amber light pouring in
// from one side, and soft bands of morning fog drifting between the
// ridges. Original SVG. Fog drifts and the light breathes via .xr-*
// classes, still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(8813);

// back (far, hazy) to front (near, dark)
const LAYERS = [
  { y: 330, n: 30, rr: 34, fill: "#3f7774", light: "#e7b56b", o: 0.55 },
  { y: 470, n: 26, rr: 46, fill: "#2b5f5e", light: "#d99a4e", o: 0.75 },
  { y: 620, n: 22, rr: 62, fill: "#1b4748", light: "#c78136", o: 0.9 },
  { y: 790, n: 18, rr: 84, fill: "#0f3134", light: "#b46a26", o: 1 },
  { y: 960, n: 14, rr: 110, fill: "#082224", light: "#9a5718", o: 1 },
].map((L) => ({
  ...L,
  crowns: Array.from({ length: L.n }, (_, i) => ({
    x: (i / (L.n - 1)) * (W + 200) - 100 + (r() - 0.5) * L.rr,
    y: L.y + (r() - 0.5) * L.rr * 0.9,
    s: 0.75 + r() * 0.5,
  })),
}));

const FOG = [
  { y: 300, h: 90, o: 0.5 },
  { y: 430, h: 110, o: 0.45 },
  { y: 580, h: 120, o: 0.4 },
  { y: 740, h: 130, o: 0.3 },
];

function Crown({ x, y, rr, fill }: { x: number; y: number; rr: number; fill: string; light: string }) {
  // a cauliflower-ish treetop: a few overlapping blobs, lit from the upper left
  return (
    <g>
      <circle cx={x} cy={y} r={rr} fill={fill} />
      <circle cx={x - rr * 0.55} cy={y + rr * 0.15} r={rr * 0.7} fill={fill} />
      <circle cx={x + rr * 0.6} cy={y + rr * 0.2} r={rr * 0.72} fill={fill} />
      <circle cx={x - rr * 0.2} cy={y - rr * 0.45} r={rr * 0.55} fill={fill} />
    </g>
  );
}

export default function CloudForestTexture({ className = "", idPrefix = "cloudforest" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2c27a" />
          <stop offset="25%" stopColor="#b98a55" />
          <stop offset="55%" stopColor="#3c6464" />
          <stop offset="100%" stopColor="#0a2224" />
        </linearGradient>
        <radialGradient id={`${p}-sun`} cx="0.12" cy="0.12" r="0.7">
          <stop offset="0%" stopColor="#fff1c9" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#f6b85a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f6b85a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5ead2" stopOpacity="0" />
          <stop offset="50%" stopColor="#f5ead2" stopOpacity="1" />
          <stop offset="100%" stopColor="#f5ead2" stopOpacity="0" />
        </linearGradient>
        <filter id={`${p}-haze`}><feGaussianBlur stdDeviation="3" /></filter>
        <filter id={`${p}-rim`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id={`${p}-fogblur`} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-sky)`} />

      {LAYERS.map((L, li) => (
        <g key={li}>
          <g filter={li < 2 ? `url(#${p}-haze)` : undefined} opacity={L.o}>
            {L.crowns.map((c, i) => (
              <Crown key={i} x={c.x} y={c.y} rr={L.rr * c.s} fill={L.fill} light={L.light} />
            ))}
          </g>
          {/* warm rim light on the sun-facing (upper-left) side of each crown */}
          <g filter={`url(#${p}-rim)`} opacity={0.5 - li * 0.06} style={{ mixBlendMode: "screen" }}>
            {L.crowns.map((c, i) => {
              const rr = L.rr * c.s;
              return <path key={i} d={`M${c.x - rr * 1.1} ${c.y + rr * 0.2} A ${rr * 1.05} ${rr * 1.05} 0 0 1 ${c.x + rr * 0.2} ${c.y - rr * 1.0}`} stroke={L.light} strokeWidth={rr * 0.22} fill="none" strokeLinecap="round" />;
            })}
          </g>
          {FOG[li] && (
            <g className={li % 2 ? "xr-fog-drift" : "xr-fog-drift-slow"} filter={`url(#${p}-fogblur)`}>
              <rect x="-200" y={FOG[li].y} width={W + 1400} height={FOG[li].h} fill={`url(#${p}-fog)`} opacity={FOG[li].o} />
              <ellipse cx={500} cy={FOG[li].y + FOG[li].h / 2} rx="420" ry={FOG[li].h * 0.6} fill="#f8eedb" opacity={FOG[li].o * 0.6} />
              <ellipse cx={1500} cy={FOG[li].y + FOG[li].h / 2} rx="520" ry={FOG[li].h * 0.5} fill="#f8eedb" opacity={FOG[li].o * 0.5} />
            </g>
          )}
        </g>
      ))}

      {/* warm light washing in from the upper left */}
      <rect className="xr-breathe" width={W} height={H} fill={`url(#${p}-sun)`} style={{ mixBlendMode: "screen", animationDuration: "11s" }} />
    </svg>
  );
}
