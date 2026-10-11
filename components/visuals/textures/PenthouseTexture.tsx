import { mulberry32 } from "./seeded";

// Penthouse: a dark marble double-height room at night -- red and magenta
// neon strips raking down from the ceiling, blue step lights climbing a
// stair, and a full glass wall onto a city that never sleeps. Original SVG.
const W = 1600, H = 1000;
const r = mulberry32(2207);
const TOWERS = Array.from({ length: 34 }, (_, i) => ({ x: 430 + i * 22 + r() * 8, w: 14 + r() * 18, h: 60 + r() * 250 }));
const WINDOWS = TOWERS.flatMap((t, i) =>
  Array.from({ length: Math.floor(t.h / 18) }, (_, k) => ({ x: t.x + 3 + (k % 2) * 6, y: 700 - t.h + 8 + k * 16, on: r() > 0.45, i })),
);
const STARS = Array.from({ length: 50 }, () => ({ x: 420 + r() * 760, y: 330 + r() * 160, o: 0.3 + r() * 0.6 }));
const VEINS = Array.from({ length: 26 }, () => {
  const side = r() > 0.5 ? 1 : 0;
  const x0 = side ? 1240 + r() * 340 : 20 + r() * 330;
  let d = `M${x0} ${r() * H}`;
  for (let k = 0; k < 5; k++) d += ` l${(r() - 0.5) * 90} ${40 + r() * 70}`;
  return d;
});

export default function PenthouseTexture({ className = "", idPrefix = "pent" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  const neon = (x1: number, y1: number, x2: number, y2: number, c: string, w: number) => (
    <g className="xr-neon-hum">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w * 4} opacity="0.25" filter={`url(#${p}-glow)`} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={w / 3} opacity="0.7" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050a1f" />
          <stop offset="70%" stopColor="#0d1a44" />
          <stop offset="100%" stopColor="#1b2a66" />
        </linearGradient>
        <linearGradient id={`${p}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a10" />
          <stop offset="100%" stopColor="#020204" />
        </linearGradient>
        <filter id={`${p}-glow`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter>
      </defs>
      <rect width={W} height={H} fill="#030306" />
      {/* glass wall */}
      <rect x="420" y="300" width="760" height="460" fill={`url(#${p}-sky)`} />
      {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r="1.2" fill="#fff" opacity={s.o} />)}
      {TOWERS.map((t, i) => <rect key={i} x={t.x} y={700 - t.h} width={t.w} height={t.h + 60} fill="#060b1d" />)}
      {WINDOWS.filter((w) => w.on).map((w, i) => <rect key={i} x={w.x} y={w.y} width="3" height="4" fill={i % 7 ? "#fcd34d" : "#93c5fd"} opacity="0.8" />)}
      {[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={420 + k * 152} y1="300" x2={420 + k * 152} y2="760" stroke="#111827" strokeWidth="6" />)}
      <line x1="420" y1="520" x2="1180" y2="520" stroke="#111827" strokeWidth="8" />
      {/* marble walls */}
      <rect x="0" y="0" width="420" height={H} fill="#07070b" />
      <rect x="1180" y="0" width="420" height={H} fill="#07070b" />
      <g stroke="#e5e7eb" strokeWidth="1.2" opacity="0.13" fill="none">{VEINS.map((d, i) => <path key={i} d={d} />)}</g>
      {/* floor with reflection */}
      <rect x="0" y="760" width={W} height="240" fill={`url(#${p}-floor)`} />
      <rect x="420" y="770" width="760" height="120" fill={`url(#${p}-sky)`} opacity="0.18" />
      {/* stair + blue step lights */}
      {Array.from({ length: 9 }, (_, k) => (
        <g key={k}>
          <rect x={60 + k * 30} y={740 - k * 48} width="150" height="10" fill="#0b0b12" />
          <line x1={60 + k * 30} y1={750 - k * 48} x2={210 + k * 30} y2={750 - k * 48} stroke="#3b82f6" strokeWidth="3" filter={`url(#${p}-glow)`} />
          <line x1={60 + k * 30} y1={750 - k * 48} x2={210 + k * 30} y2={750 - k * 48} stroke="#93c5fd" strokeWidth="1.5" />
        </g>
      ))}
      {/* ceiling neon */}
      {neon(540, -20, 640, 300, "#ff3fa4", 5)}
      {neon(820, -20, 830, 260, "#ff3b3b", 14)}
      {neon(1560, 40, 1300, 270, "#ff3b3b", 6)}
      {neon(0, 150, 180, 270, "#ff3b3b", 5)}
      {neon(1300, 560, 1500, 520, "#fb923c", 3)}
      {/* floor reflections of the neon */}
      <g opacity="0.35">{neon(720, 1000, 760, 800, "#ff3b3b", 6)}{neon(320, 1000, 380, 820, "#ff3fa4", 3)}</g>
    </svg>
  );
}
