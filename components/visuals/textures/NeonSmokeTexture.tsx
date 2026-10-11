import { mulberry32 } from "./seeded";

// Neon Smoke: violet and electric-blue plumes curling up from the bottom of
// the frame with flecks of UV paint in the dark -- the artist's studio mood.
// Original SVG; plumes breathe slowly (.xr-smoke), still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(5150);
const PLUMES = Array.from({ length: 14 }, (_, i) => ({
  cx: (i / 13) * W + (r() - 0.5) * 160,
  cy: 520 + r() * 520,
  rx: 160 + r() * 260,
  ry: 120 + r() * 220,
  c: i % 3 === 0 ? "#2563eb" : i % 3 === 1 ? "#d946ef" : "#7c3aed",
  dur: 16 + r() * 18,
  delay: r() * 20,
}));
const FLECKS = Array.from({ length: 140 }, () => ({
  x: r() * W, y: 380 + r() * 620, rr: 0.8 + r() * 3.2,
  c: ["#22d3ee", "#f0abfc", "#a3e635", "#60a5fa", "#e879f9"][Math.floor(r() * 5)], o: 0.25 + r() * 0.6,
}));

export default function NeonSmokeTexture({ className = "", idPrefix = "smoke" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="70%" r="85%">
          <stop offset="0%" stopColor="#1a0b33" />
          <stop offset="60%" stopColor="#0a0518" />
          <stop offset="100%" stopColor="#030208" />
        </radialGradient>
        <filter id={`${p}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="120" />
          <feGaussianBlur stdDeviation="38" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      <g filter={`url(#${p}-blur)`} style={{ mixBlendMode: "screen" }}>
        {PLUMES.map((m, i) => (
          <ellipse key={i} className="xr-smoke" cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill={m.c} opacity="0.7"
            style={{ animationDuration: `${m.dur}s`, animationDelay: `-${m.delay}s` }} />
        ))}
      </g>
      <g>
        {FLECKS.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.rr} fill={f.c} opacity={f.o} />
        ))}
      </g>
      <rect y={H - 140} width={W} height="140" fill="#05020c" opacity="0.6" />
    </svg>
  );
}
