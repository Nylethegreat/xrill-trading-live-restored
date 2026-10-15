import { mulberry32 } from "./seeded";

// Campus Palms: a Miami university plaza in late-afternoon light — tall
// slender royal palms framing a walkway, low white buildings with navy
// trim, a pedestrian bridge wrapped in a bright abstract mural, and a
// tower in the distance. Original SVG inspired by the FIU look (no logos
// or real artwork). Fronds sway and clouds drift via .xr-* classes,
// still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(7741);

const CLOUDS = Array.from({ length: 7 }, () => ({ x: r() * W, y: 90 + r() * 220, s: 0.7 + r() * 1.1 }));
const MURAL_COLORS = ["#f59e0b", "#ef4444", "#2563eb", "#facc15", "#14b8a6", "#f97316", "#7c3aed"];
const MURAL = Array.from({ length: 26 }, (_, i) => ({ x: 470 + i * 25 + r() * 10, rr: 9 + r() * 12, c: MURAL_COLORS[Math.floor(r() * MURAL_COLORS.length)] }));

// x, base y, height, lean, near?
const PALMS = [
  { x: 120, h: 900, lean: -0.08, near: true },
  { x: 300, h: 760, lean: 0.04, near: false },
  { x: 420, h: 620, lean: -0.02, near: false },
  { x: 610, h: 700, lean: 0.03, near: false },
  { x: 1000, h: 720, lean: -0.03, near: false },
  { x: 1180, h: 640, lean: 0.02, near: false },
  { x: 1300, h: 820, lean: 0.05, near: false },
  { x: 1480, h: 960, lean: 0.09, near: true },
];
const GROUND = 900;

function Palm({ x, h, lean, near, i }: { x: number; h: number; lean: number; near: boolean; i: number }) {
  const topX = x + lean * h;
  const topY = GROUND - h;
  const tw = near ? 22 : 11;
  const fronds = 9;
  return (
    <g opacity={near ? 1 : 0.9}>
      <path d={`M${x - tw / 2} ${GROUND} Q${x + lean * h * 0.4} ${GROUND - h * 0.5} ${topX - tw * 0.3} ${topY} L${topX + tw * 0.3} ${topY} Q${x + lean * h * 0.4 + tw} ${GROUND - h * 0.5} ${x + tw / 2} ${GROUND}Z`} fill={near ? "#3a3326" : "#6b5d48"} />
      <g className="xr-palm-sway" style={{ transformOrigin: `${topX}px ${topY}px`, animationDuration: `${5 + (i % 4)}s`, animationDelay: `-${i * 0.7}s` }}>
        {Array.from({ length: fronds }, (_, k) => {
          const a = Math.PI + (k / (fronds - 1)) * Math.PI;
          const len = (near ? 210 : 130) * (0.8 + ((k * 7) % 5) / 12);
          const ex = topX + Math.cos(a) * len;
          const ey = topY + Math.sin(a) * len * 0.45 + len * 0.42;
          const cx = topX + Math.cos(a) * len * 0.55;
          const cy = topY + Math.sin(a) * len * 0.7 - 10;
          // leaflets hang off both sides of the rib, shortening toward the tip
          const leaflets = [];
          for (let t = 0.12; t < 0.98; t += 0.055) {
            const qx = (1 - t) * (1 - t) * topX + 2 * (1 - t) * t * cx + t * t * ex;
            const qy = (1 - t) * (1 - t) * topY + 2 * (1 - t) * t * cy + t * t * ey;
            const L = (near ? 46 : 28) * (1 - t * 0.7);
            for (const side of [-1, 1]) {
              const dx = Math.cos(a + side * 0.9) * L * 0.5;
              leaflets.push(`M${qx.toFixed(1)} ${qy.toFixed(1)} l${dx.toFixed(1)} ${(L * 0.85).toFixed(1)}`);
            }
          }
          return (
            <g key={k}>
              <path d={leaflets.join(" ")} stroke={near ? "#1f4a2a" : "#3d7a45"} strokeWidth={near ? 4 : 2.6} strokeLinecap="round" fill="none" />
              <path d={`M${topX} ${topY} Q${cx} ${cy} ${ex} ${ey}`} stroke={near ? "#2a4d2c" : "#4f8a4f"} strokeWidth={near ? 4 : 2.4} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
      </g>
    </g>
  );
}

export default function CampusPalmsTexture({ className = "", idPrefix = "campus" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e4fa8" />
          <stop offset="45%" stopColor="#3f86d6" />
          <stop offset="78%" stopColor="#9cc7ea" />
          <stop offset="100%" stopColor="#f6d79a" />
        </linearGradient>
        <radialGradient id={`${p}-sun`} cx="0.82" cy="0.62" r="0.35">
          <stop offset="0%" stopColor="#fff4cc" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff4cc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-plaza`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9b2a4" />
          <stop offset="100%" stopColor="#6f685c" />
        </linearGradient>
        <filter id={`${p}-cloud`}><feGaussianBlur stdDeviation="8" /></filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-sky)`} />
      <rect width={W} height={H} fill={`url(#${p}-sun)`} />

      <g className="xr-fog-drift-slow" filter={`url(#${p}-cloud)`} opacity="0.9">
        {CLOUDS.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`} fill="#ffffff">
            <ellipse cx="0" cy="0" rx="90" ry="34" />
            <ellipse cx="-50" cy="10" rx="60" ry="26" />
            <ellipse cx="55" cy="8" rx="70" ry="28" />
            <ellipse cx="10" cy="-26" rx="50" ry="30" />
          </g>
        ))}
      </g>

      {/* distant tower */}
      <g>
        <rect x="690" y="430" width="230" height="210" fill="#e8eef4" />
        <rect x="740" y="400" width="130" height="40" fill="#dfe7ef" />
        {Array.from({ length: 7 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => (
            <rect key={`${row}-${col}`} x={704 + col * 27} y={450 + row * 26} width="16" height="16" rx="7" fill="#7fb3d5" opacity="0.85" />
          )),
        )}
        <rect x="785" y="408" width="40" height="18" fill="#1e3a8a" opacity="0.8" />
      </g>

      {/* low campus buildings either side */}
      <path d="M0 470 L330 520 L330 760 L0 760Z" fill="#cfcac0" />
      <path d="M0 455 L330 505 L330 520 L0 470Z" fill="#9b2c3a" />
      <rect x="40" y="560" width="230" height="40" fill="#2b3442" opacity="0.75" />
      <path d="M1600 470 L1270 520 L1270 760 L1600 760Z" fill="#cfcac0" />
      <path d="M1600 455 L1270 505 L1270 520 L1600 470Z" fill="#9b2c3a" />
      <rect x="1330" y="560" width="230" height="40" fill="#2b3442" opacity="0.75" />

      {/* pedestrian bridge with the mural band */}
      <rect x="330" y="610" width="940" height="10" fill="#e5e7eb" />
      {Array.from({ length: 48 }, (_, i) => (
        <rect key={i} x={335 + i * 19.5} y="620" width="2" height="26" fill="#e5e7eb" opacity="0.8" />
      ))}
      <rect x="440" y="646" width="720" height="64" fill="#e7a83a" />
      <g>
        {MURAL.map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy="678" r={m.rr} fill="none" stroke={m.c} strokeWidth="5" />
            <circle cx={m.x} cy="678" r={m.rr * 0.45} fill={m.c} opacity="0.85" />
          </g>
        ))}
        <path d="M440 700 Q520 660 600 700 T760 700 T920 700 T1080 700 T1160 690" stroke="#1d4ed8" strokeWidth="5" fill="none" opacity="0.8" />
      </g>
      <rect x="440" y="710" width="720" height="6" fill="#d1d5db" />
      {/* stairs under the bridge */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={640 - i * 4} y={716 + i * 9} width={120 + i * 8} height="5" fill="#9ca3af" opacity="0.9" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={`b${i}`} x={840 - i * 4} y={716 + i * 9} width={120 + i * 8} height="5" fill="#9ca3af" opacity="0.9" />
      ))}

      {/* plaza + planters */}
      <path d="M0 800 L1600 800 L1600 1000 L0 1000Z" fill={`url(#${p}-plaza)`} />
      <path d="M0 790 L380 800 L380 830 L0 840Z" fill="#e5e2da" />
      <path d="M1600 790 L1220 800 L1220 830 L1600 840Z" fill="#e5e2da" />
      <path d="M0 760 Q120 720 260 770 L380 800 L0 800Z" fill="#2f6b3c" />
      <path d="M1600 760 Q1480 720 1340 770 L1220 800 L1600 800Z" fill="#2f6b3c" />
      {/* long late-afternoon shadows */}
      {PALMS.map((pm, i) => (
        <path key={i} d={`M${pm.x} ${GROUND} L${pm.x - 260} ${1000} L${pm.x - 230} ${1000} L${pm.x + 4} ${GROUND}Z`} fill="#000" opacity="0.14" />
      ))}

      {PALMS.filter((pm) => !pm.near).map((pm, i) => <Palm key={i} {...pm} i={i} />)}
      {PALMS.filter((pm) => pm.near).map((pm, i) => <Palm key={`n${i}`} {...pm} i={i + 4} />)}
    </svg>
  );
}
