import { mulberry32 } from "./seeded";

// Net Brain: a side-view brain built from a point network (each node linked
// to its nearest neighbours), floating over blurred columns of code and a
// glowing node floor. Original SVG. Nodes fire in waves front-to-back via
// .xr-net-fire; still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(2024);

function inBrain(x: number, y: number) {
  const e = (cx: number, cy: number, rx: number, ry: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
  const cerebrum = e(830, 390, 380, 255) && y < 590;
  const frontal = e(560, 430, 150, 170);
  const temporal = e(820, 560, 270, 105);
  const cerebellum = e(1075, 595, 135, 78);
  const stem = x > 935 && x < 1000 && y > 560 && y < 800 - (x - 935) * 0.5;
  return cerebrum || frontal || temporal || cerebellum || stem;
}

const PTS: { x: number; y: number; d: string }[] = [];
while (PTS.length < 950) {
  const x = 430 + r() * 800, y = 120 + r() * 690;
  // Fire delay sweeps front-to-back, so pulses roll across the brain in waves.
  if (inBrain(x, y)) PTS.push({ x, y, d: (((x - 430) / 800) * 4 + r() * 0.6).toFixed(2) });
}
const LINKS: [number, number][] = [];
PTS.forEach((p, i) => {
  const near = PTS.map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
    .filter((o) => o.j > i && o.d < 58 * 58)
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
  for (const o of near) LINKS.push([i, o.j]);
});
const LINK_PATH = LINKS.map(([i, j]) => `M${PTS[i].x.toFixed(1)} ${PTS[i].y.toFixed(1)}L${PTS[j].x.toFixed(1)} ${PTS[j].y.toFixed(1)}`).join("");
const CODE = Array.from({ length: 26 }, (_, i) => ({ x: 20 + i * 62 + r() * 20, rows: Array.from({ length: 34 }, () => 10 + r() * 46), o: 0.05 + r() * 0.18 }));
const FLOOR = Array.from({ length: 90 }, () => ({ x: r() * W, y: 860 + r() * 140, rr: 2 + r() * 5 }));
const BOKEH = Array.from({ length: 30 }, () => ({ x: r() * W, y: r() * H, rr: 6 + r() * 26 }));

export default function NetBrainTexture({ className = "", idPrefix = "netbrain" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <filter id={`${p}-blur`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={`${p}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id={`${p}-bg`} cx="55%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#0b2a33" />
          <stop offset="100%" stopColor="#020608" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      <g filter={`url(#${p}-blur)`}>
        {CODE.map((c, i) => (
          <g key={i} opacity={c.o}>
            {c.rows.map((w, k) => (
              <rect key={k} x={c.x} y={20 + k * 28} width={w} height="7" fill="#7dd3fc" />
            ))}
          </g>
        ))}
        {BOKEH.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.rr} fill="#67e8f9" opacity="0.12" />
        ))}
      </g>
      <path className="xr-net-shimmer" d={LINK_PATH} stroke="#a5f3fc" strokeWidth="1" opacity="0.55" fill="none" />
      <g filter={`url(#${p}-glow)`}>
        {PTS.map((pt, i) => (
          <circle key={i} className="xr-net-fire" style={{ animationDelay: `${pt.d}s` }} cx={pt.x} cy={pt.y} r={i % 7 === 0 ? 4 : 2.2} fill="#ecfeff" />
        ))}
      </g>
      <g filter={`url(#${p}-blur)`}>
        {FLOOR.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.rr} fill="#67e8f9" opacity="0.35" />
        ))}
      </g>
    </svg>
  );
}
