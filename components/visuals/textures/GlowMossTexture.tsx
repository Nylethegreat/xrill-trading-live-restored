import { mulberry32 } from "./seeded";

// Glow Moss: a macro shot of a dark forest floor — mounds of deep-emerald
// moss and fern fronds, beaded with dew drops that glow soft neon cyan,
// and faint green light paths winding through. Original SVG. Dew twinkles
// and the light paths flow via .xr-* classes, still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(1207);

const MOUNDS = Array.from({ length: 9 }, (_, i) => ({ x: (i / 8) * W + (r() - 0.5) * 120, y: 820 + r() * 120, rx: 220 + r() * 160, ry: 90 + r() * 60 }));
const TUFTS = Array.from({ length: 520 }, () => {
  const m = MOUNDS[Math.floor(r() * MOUNDS.length)];
  const a = r() * Math.PI;
  const d = Math.sqrt(r());
  return { x: m.x + Math.cos(a) * m.rx * d, y: m.y - Math.sin(a) * m.ry * d, rr: 3 + r() * 7, light: r() };
});
const FERNS = [
  { x: 180, y: 980, a: -1.25, len: 520 },
  { x: 420, y: 1000, a: -1.7, len: 420 },
  { x: 1260, y: 990, a: -1.95, len: 560 },
  { x: 1480, y: 1000, a: -1.5, len: 380 },
  { x: 820, y: 1010, a: -1.4, len: 300 },
];
const DEW = Array.from({ length: 90 }, () => ({ x: r() * W, y: 380 + r() * 600, rr: 2 + r() * 5, dur: 3 + r() * 5, delay: r() * 6 }));
const SPORES = Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * 700, rr: 0.6 + r() * 1.6, o: 0.15 + r() * 0.45 }));

function fernPath(x: number, y: number, a: number, len: number) {
  // gently curling stem
  const steps = 22;
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = a + t * t * 1.1;
    const px = x + Math.cos(a) * len * t + Math.cos(ang + Math.PI / 2) * 30 * t * t;
    const py = y + Math.sin(a) * len * t + Math.sin(ang + Math.PI / 2) * 30 * t * t;
    pts.push([px, py, ang]);
  }
  return pts;
}

export default function GlowMossTexture({ className = "", idPrefix = "moss" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="85%" r="90%">
          <stop offset="0%" stopColor="#0f3b2b" />
          <stop offset="55%" stopColor="#06231a" />
          <stop offset="100%" stopColor="#020b08" />
        </radialGradient>
        <radialGradient id={`${p}-dew`}>
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="35%" stopColor="#67e8f9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <filter id={`${p}-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={`${p}-soft`}><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      {SPORES.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.rr} fill="#a7f3d0" opacity={s.o} />)}

      {/* winding light paths */}
      <g filter={`url(#${p}-glow)`} style={{ mixBlendMode: "screen" }}>
        <path className="xr-moss-flow" d="M-50 700 C 250 600 380 760 640 660 S 1000 520 1250 640 S 1550 720 1700 600" stroke="#4ade80" strokeWidth="4" fill="none" strokeDasharray="40 260" opacity="0.8" />
        <path className="xr-moss-flow" d="M-50 560 C 300 480 520 620 780 540 S 1200 400 1700 500" stroke="#22d3ee" strokeWidth="3" fill="none" strokeDasharray="30 300" opacity="0.6" style={{ animationDuration: "18s" }} />
      </g>

      {/* ferns */}
      {FERNS.map((f, i) => {
        const pts = fernPath(f.x, f.y, f.a, f.len);
        const stem = `M${pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L")}`;
        return (
          <g key={i} filter={i % 2 ? `url(#${p}-soft)` : undefined} opacity={i % 2 ? 0.6 : 0.9}>
            <path d={stem} stroke="#14532d" strokeWidth="5" fill="none" strokeLinecap="round" />
            {pts.slice(1, -2).map((q, k) => {
              const L = 70 * (1 - k / pts.length) + 14;
              return [1, -1].map((side) => {
                const ang = q[2] + side * 1.15;
                return (
                  <path
                    key={`${k}-${side}`}
                    d={`M${q[0]} ${q[1]} q${Math.cos(ang) * L * 0.5} ${Math.sin(ang) * L * 0.5 - 6} ${Math.cos(ang) * L} ${Math.sin(ang) * L}`}
                    stroke="#166534"
                    strokeWidth="9"
                    strokeLinecap="round"
                    fill="none"
                  />
                );
              });
            })}
            {pts.slice(1, -2).map((q, k) => (k % 3 === 0 ? <circle key={`d${k}`} cx={q[0]} cy={q[1]} r="3" fill="#a5f3fc" opacity="0.8" /> : null))}
          </g>
        );
      })}

      {/* moss mounds */}
      {MOUNDS.map((m, i) => <ellipse key={i} cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill="#0b3a22" />)}
      {TUFTS.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={t.rr} fill={t.light > 0.8 ? "#3f8f4e" : t.light > 0.4 ? "#1f6b36" : "#145226"} />
      ))}

      {/* glowing dew */}
      {DEW.map((d, i) => (
        <g key={i} className="xr-moss-twinkle" style={{ animationDuration: `${d.dur}s`, animationDelay: `-${d.delay}s` }}>
          <circle cx={d.x} cy={d.y} r={d.rr * 3.2} fill={`url(#${p}-dew)`} opacity="0.55" />
          <circle cx={d.x} cy={d.y} r={d.rr} fill="#cffafe" opacity="0.9" />
        </g>
      ))}
    </svg>
  );
}
