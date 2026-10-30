import { mulberry32 } from "./seeded";

// Mirror Aurora: the Glass Aurora sky, mirrored -- aurora light refracted through glass — slow painterly
// ribbons of cyan, violet and warm gold rolling across a deep slate field,
// split by faint prism edges and diagonal glints, with a fine line grid
// echoing a chart, all mirrored in a glass floor below the horizon with
// rippling light lines and a sheen that sweeps across the pane. Original
// SVG. Ribbons drift, the reflection ripples and the sheen sweeps via the
// .xr-glass-* / .xr-* classes; still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(4470);
const SPECKS = Array.from({ length: 90 }, () => ({ x: r() * W, y: r() * H, rr: 0.5 + r() * 1.3, o: 0.15 + r() * 0.5 }));
const HORIZON = 700;
const RIPPLES = Array.from({ length: 22 }, (_, i) => ({
  y: HORIZON + 14 + i * 13 + r() * 6,
  x: r() * W,
  w: 160 + r() * 520,
  o: 0.05 + (1 - i / 22) * 0.18,
  d: (r() * 6).toFixed(2),
}));

// The three ribbons, drawn once for the sky and again flipped for the
// reflection. Each drifts on its own path and timing.
function Ribbons({ p }: { p: string }) {
  return (
    <>
      <path className="xr-glass-drift" d="M-200 380 C 150 200 450 520 800 340 S 1350 160 1800 360 L1800 520 C 1400 380 1100 600 780 520 S 200 420 -200 560Z" fill={`url(#${p}-cyan)`} />
      <path className="xr-glass-drift-b" d="M-200 560 C 200 440 520 700 900 560 S 1450 420 1800 600 L1800 720 C 1450 600 1100 800 800 720 S 200 640 -200 740Z" fill={`url(#${p}-violet)`} />
      <path className="xr-glass-drift-c" d="M-200 220 C 250 120 600 300 1000 180 S 1500 120 1800 220 L1800 320 C 1450 260 1150 380 900 300 S 250 240 -200 340Z" fill={`url(#${p}-gold)`} />
    </>
  );
}

const SHARDS = Array.from({ length: 6 }, (_, i) => {
  const x = 150 + i * 260 + (r() - 0.5) * 80;
  return { x, w: 60 + r() * 120, o: 0.018 + r() * 0.025 };
});

export default function MirrorAuroraTexture({ className = "", idPrefix = "mirroraurora" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1020" />
          <stop offset="60%" stopColor="#111a2e" />
          <stop offset="100%" stopColor="#080b16" />
        </linearGradient>
        <linearGradient id={`${p}-cyan`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-violet`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="55%" stopColor="#a78bfa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-gold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
          <stop offset="50%" stopColor="#fcd34d" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-glint`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${p}-soft`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="38" /></filter>
        <linearGradient id={`${p}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1426" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#04060d" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${p}-fadegrad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${p}-fade`} maskUnits="userSpaceOnUse" x="0" y={HORIZON} width={W} height={H - HORIZON}>
          <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill={`url(#${p}-fadegrad)`} />
        </mask>
        <linearGradient id={`${p}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#e0f2fe" stopOpacity="0.07" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#e0f2fe" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${p}-grid`} width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0 L0 0 0 80" fill="none" stroke="#94a3b8" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      <rect width={W} height={H} fill={`url(#${p}-grid)`} />
      {SPECKS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.rr} fill="#e2e8f0" opacity={s.o} />)}

      <g filter={`url(#${p}-soft)`} style={{ mixBlendMode: "screen" }}>
        <Ribbons p={p} />
      </g>

      {/* Glass floor: the sky mirrored below the horizon, fading with depth */}
      <rect y={HORIZON} width={W} height={H - HORIZON} fill={`url(#${p}-floor)`} />
      <g mask={`url(#${p}-fade)`}>
        <g transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`} filter={`url(#${p}-soft)`} style={{ mixBlendMode: "screen" }} opacity="0.5">
          <Ribbons p={p} />
        </g>
        {RIPPLES.map((rp, i) => (
          <rect
            key={i}
            className="xr-glass-ripple"
            style={{ animationDelay: `${rp.d}s` }}
            x={rp.x - rp.w / 2}
            y={rp.y}
            width={rp.w}
            height="1.6"
            rx="0.8"
            fill="#e0f2fe"
            opacity={rp.o}
          />
        ))}
      </g>
      <line x1="0" y1={HORIZON} x2={W} y2={HORIZON} stroke="#e0f2fe" strokeOpacity="0.18" strokeWidth="1.2" />

      {/* refraction: faint prism shards and diagonal glints */}
      {SHARDS.map((s, i) => (
        <path key={i} d={`M${s.x} -20 L${s.x + s.w} -20 L${s.x + s.w - 380} ${H + 20} L${s.x - 380} ${H + 20}Z`} fill="#c7d2fe" opacity={s.o} />
      ))}
      {[260, 720, 1180].map((x, i) => (
        <path
          key={i}
          className={i % 2 ? "xr-breathe" : "xr-breathe-alt"}
          d={`M${x} -20 L${x + 6} -20 L${x - 374} ${H + 20} L${x - 380} ${H + 20}Z`}
          fill={`url(#${p}-glint)`}
          opacity="0.16"
          style={{ animationDuration: `${8 + i * 2}s` }}
        />
      ))}

      {/* light catching the glass: a slow sheen sweeping across the pane */}
      <rect className="xr-glass-sweep" x="-600" y="-200" width="500" height={H + 400} fill={`url(#${p}-sheen)`} transform="skewX(-20)" />
    </svg>
  );
}
