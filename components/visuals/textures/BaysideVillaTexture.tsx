import { mulberry32 } from "./seeded";
import { Palm } from "./palmShape";

// Bayside Villa: a Miami waterfront estate at midday — an infinity pool
// spilling toward Biscayne-blue water, a downtown skyline across the bay
// with sailboats, a white column pergola, cream stone deck with white
// loungers, tropical planters and tall leaning coconut palms. Original
// SVG. Pool caustics shimmer and fronds sway via .xr-* classes, still
// under reduced motion.
const W = 1600, H = 1000;
const HORIZON = 470;
const r = mulberry32(9127);

const TOWERS = Array.from({ length: 34 }, (_, i) => {
  const x = 380 + i * 30 + r() * 10;
  const h = 40 + r() * (i > 8 && i < 24 ? 150 : 80);
  return { x, w: 16 + r() * 16, h, c: r() > 0.5 ? "#9fb3c8" : "#7d95ad" };
});
const BOATS = Array.from({ length: 9 }, () => ({ x: 150 + r() * 1300, y: HORIZON + 15 + r() * 60, s: 0.5 + r() * 0.6 }));
const CAUSTICS = Array.from({ length: 40 }, () => ({ x: 340 + r() * 900, y: 640 + r() * 300, w: 20 + r() * 60, a: r() * 3 }));

function Lounger({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path d="M0 0 L170 0 L190 -10 L210 -60 L222 -56 L205 10 L0 10Z" fill="#f8f5ee" />
      <rect x="0" y="10" width="205" height="10" fill="#b8a98f" />
      <rect x="10" y="20" width="8" height="20" fill="#8a7a62" />
      <rect x="185" y="20" width="8" height="20" fill="#8a7a62" />
    </g>
  );
}

export default function BaysideVillaTexture({ className = "", idPrefix = "villa" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f86d8" />
          <stop offset="70%" stopColor="#8cc4ee" />
          <stop offset="100%" stopColor="#d8ecfa" />
        </linearGradient>
        <linearGradient id={`${p}-bay`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5bb4d8" />
          <stop offset="100%" stopColor="#2a86b8" />
        </linearGradient>
        <linearGradient id={`${p}-pool`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fe0e6" />
          <stop offset="60%" stopColor="#19b6c9" />
          <stop offset="100%" stopColor="#0e8fa8" />
        </linearGradient>
        <linearGradient id={`${p}-deck`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9dcc3" />
          <stop offset="100%" stopColor="#c9b590" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-sky)`} />
      {/* soft clouds */}
      <g fill="#ffffff" opacity="0.7" className="xr-fog-drift-slow">
        <ellipse cx="300" cy="140" rx="140" ry="22" />
        <ellipse cx="900" cy="100" rx="200" ry="26" />
        <ellipse cx="1350" cy="190" rx="160" ry="20" />
      </g>

      {/* skyline across the bay */}
      {TOWERS.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={HORIZON - t.h} width={t.w} height={t.h} fill={t.c} />
          <rect x={t.x + 2} y={HORIZON - t.h + 4} width={t.w * 0.3} height={t.h - 8} fill="#dbe7f2" opacity="0.35" />
        </g>
      ))}
      <rect x="0" y={HORIZON - 6} width={W} height="8" fill="#5c7b5a" opacity="0.6" />

      {/* bay + boats */}
      <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill={`url(#${p}-bay)`} />
      <g stroke="#e6f6ff" strokeWidth="1.5" opacity="0.4">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={(i * 137) % 1500} y1={HORIZON + 20 + i * 7} x2={(i * 137) % 1500 + 70} y2={HORIZON + 20 + i * 7} />
        ))}
      </g>
      {BOATS.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          <path d="M-30 0 L30 0 L22 9 L-22 9Z" fill="#f8fafc" />
          <line x1="0" y1="0" x2="0" y2="-60" stroke="#e2e8f0" strokeWidth="2" />
          {i % 3 === 0 && <path d="M2 -56 L24 -6 L2 -6Z" fill="#f8fafc" opacity="0.9" />}
        </g>
      ))}

      {/* stone deck */}
      <path d="M0 600 L1600 600 L1600 1000 L0 1000Z" fill={`url(#${p}-deck)`} />
      {/* pool: infinity edge toward the bay, curved near edge */}
      <path d="M260 610 L1300 610 Q1350 700 1260 780 Q1150 900 900 930 Q600 960 420 900 Q260 840 300 740 Q320 680 260 610Z" fill={`url(#${p}-pool)`} />
      <path d="M260 606 L1300 606 L1300 614 L260 614Z" fill="#cdeff4" />
      <g className="xr-lake-shimmer" stroke="#e8fdff" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        {CAUSTICS.map((c, i) => (
          <path key={i} d={`M${c.x} ${c.y} q${c.w / 2} ${-6 - c.a * 2} ${c.w} 0`} fill="none" />
        ))}
      </g>
      {/* hot tub + boulder */}
      <ellipse cx="560" cy="935" rx="150" ry="50" fill="#d4c3a0" />
      <ellipse cx="560" cy="930" rx="128" ry="38" fill="#2fc6d4" />
      <path d="M980 740 Q1030 700 1090 730 Q1120 770 1070 790 Q1000 800 980 740Z" fill="#a08c6c" />

      {/* planters with tropical leaves */}
      {[{ x: 210, y: 720 }, { x: 1290, y: 820 }, { x: 860, y: 640 }].map((pl, i) => (
        <g key={i} transform={`translate(${pl.x} ${pl.y})`}>
          {Array.from({ length: 9 }, (_, k) => {
            const a = -Math.PI + (k / 8) * Math.PI;
            return <path key={k} d={`M0 0 Q${Math.cos(a) * 40} ${Math.sin(a) * 60 - 10} ${Math.cos(a) * 80} ${Math.sin(a) * 70 + 20}`} stroke={k % 2 ? "#2f7d3c" : "#4c9a4a"} strokeWidth="9" fill="none" strokeLinecap="round" />;
          })}
          {i !== 2 && <circle cx="14" cy="-8" r="7" fill="#ef4444" />}
          {i !== 2 && <circle cx="-22" cy="-2" r="6" fill="#f97316" />}
        </g>
      ))}

      {/* left villa wall + tiled eave */}
      <path d="M0 0 L180 0 L210 560 L0 600Z" fill="#f4efe6" />
      <path d="M0 0 L260 0 L230 60 L0 70Z" fill="#b5653f" />
      <rect x="40" y="200" width="110" height="260" fill="#2a3340" opacity="0.8" />
      <path d="M150 560 L260 650 L250 660 L140 575Z" fill="#e5ded1" />

      {/* right pergola */}
      <path d="M1360 0 L1600 0 L1600 120 L1340 90Z" fill="#f4efe6" />
      <path d="M1340 90 L1600 120 L1600 140 L1340 108Z" fill="#cfc6b6" />
      {[1380, 1500].map((x) => (
        <g key={x}>
          <rect x={x} y="108" width="40" height="560" fill="#fbf8f2" />
          <rect x={x + 26} y="108" width="14" height="560" fill="#e2dbcd" />
          <rect x={x - 8} y="660" width="56" height="20" fill="#e2dbcd" />
        </g>
      ))}

      <Lounger x={20} y={880} />
      <Lounger x={1590} y={760} flip />

      {/* coconut palms */}
      <Palm x={360} baseY={640} h={560} lean={0.18} scale={1.2} trunk="#7a6650" frond="#2f7d3c" rib="#245f2f" i={0} />
      <Palm x={700} baseY={620} h={520} lean={0.16} scale={1.05} trunk="#806a52" frond="#3b8a43" rib="#2a6631" i={1} />
      <Palm x={1080} baseY={620} h={500} lean={-0.12} scale={1} trunk="#806a52" frond="#3b8a43" rib="#2a6631" i={2} />
      <Palm x={1230} baseY={640} h={600} lean={-0.03} scale={1.15} trunk="#7a6650" frond="#2f7d3c" rib="#245f2f" i={3} />
    </svg>
  );
}
