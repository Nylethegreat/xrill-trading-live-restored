import { mulberry32 } from "./seeded";

// Coral Reef: sunlight breaking through the surface into clear teal water,
// a school of small fish drifting across, bubbles rising, and a bed of
// blue / violet / lime staghorn coral along the bottom. Original SVG (not a
// photo). Rays breathe, fish swim, bubbles rise and the coral sways via the
// .xr-* classes in globals.css, all still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(5521);

type Seg = { d: string; w: number };

// Branching staghorn: each branch splits into 2-3 thinner, shorter ones.
function branch(x: number, y: number, ang: number, len: number, w: number, depth: number, out: Seg[]) {
  const x2 = x + Math.cos(ang) * len;
  const y2 = y + Math.sin(ang) * len;
  const bend = (r() - 0.5) * len * 0.35;
  const cx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * bend;
  const cy = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * bend;
  out.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, w });
  if (depth <= 0) return;
  const kids = 2 + (r() > 0.6 ? 1 : 0);
  for (let k = 0; k < kids; k++) {
    const spread = (k - (kids - 1) / 2) * (0.45 + r() * 0.3);
    branch(x2, y2, ang + spread + (r() - 0.5) * 0.2, len * (0.62 + r() * 0.18), w * 0.68, depth - 1, out);
  }
}

const CORAL_COLORS = [
  ["#3b6fd8", "#93c5fd"],
  ["#6d4fd8", "#c4b5fd"],
  ["#5e9b78", "#d9f99d"],
  ["#2f5fb8", "#a5b4fc"],
  ["#7aa7a0", "#e0f2fe"],
];

const CORALS = Array.from({ length: 34 }, (_, i) => {
  const segs: Seg[] = [];
  const x = (i / 34) * (W + 120) - 60 + (r() - 0.5) * 40;
  const base = H - 10 - r() * 60;
  const size = 34 + r() * 46;
  const stems = 2 + Math.floor(r() * 3);
  for (let s = 0; s < stems; s++) branch(x + (r() - 0.5) * 30, base, -Math.PI / 2 + (r() - 0.5) * 0.9, size, 7 + r() * 3, 3, segs);
  const c = CORAL_COLORS[Math.floor(r() * CORAL_COLORS.length)];
  return { segs, c, far: i % 3 === 0, dur: 7 + r() * 6, delay: r() * 8, x, base };
}).sort((a, b) => Number(b.far) - Number(a.far));

const FISH = Array.from({ length: 70 }, () => ({
  x: 300 + r() * 1100,
  y: 260 + r() * 360,
  s: 0.5 + r() * 1.1,
  gold: r() > 0.86,
  o: 0.35 + r() * 0.5,
}));
const BUBBLES = Array.from({ length: 34 }, () => ({ x: r() * W, rr: 2 + r() * 6, dur: 10 + r() * 14, delay: r() * 20 }));
const RAYS = Array.from({ length: 9 }, (_, i) => ({ a: -0.9 + i * 0.22 + r() * 0.08, w: 30 + r() * 70, o: 0.08 + r() * 0.12 }));

export default function CoralReefTexture({ className = "", idPrefix = "reef" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  const sunX = 1080, sunY = -40;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fa3b0" />
          <stop offset="30%" stopColor="#1f6f86" />
          <stop offset="70%" stopColor="#0d3b5c" />
          <stop offset="100%" stopColor="#061a2e" />
        </linearGradient>
        <radialGradient id={`${p}-sun`} cx={sunX / W} cy="0" r="0.45">
          <stop offset="0%" stopColor="#fffbe6" stopOpacity="0.95" />
          <stop offset="25%" stopColor="#d9f2f0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#d9f2f0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0fdfa" stopOpacity="1" />
          <stop offset="100%" stopColor="#f0fdfa" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#061a2e" stopOpacity="0" />
          <stop offset="100%" stopColor="#030c17" stopOpacity="0.9" />
        </linearGradient>
        <filter id={`${p}-blur`}><feGaussianBlur stdDeviation="3" /></filter>
        <filter id={`${p}-rayblur`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-water)`} />
      <rect width={W} height={H} fill={`url(#${p}-sun)`} />

      {/* light rays fanning down from the sun */}
      <g filter={`url(#${p}-rayblur)`} style={{ mixBlendMode: "screen" }}>
        {RAYS.map((ray, i) => {
          const len = 1150;
          const ex = sunX + Math.sin(ray.a) * len;
          const ey = sunY + Math.cos(ray.a) * len;
          return (
            <path
              key={i}
              className={i % 2 ? "xr-breathe" : "xr-breathe-alt"}
              d={`M${sunX - 8} ${sunY} L${ex - ray.w} ${ey} L${ex + ray.w} ${ey} L${sunX + 8} ${sunY}Z`}
              fill={`url(#${p}-ray)`}
              opacity={ray.o * 2.4}
              style={{ animationDuration: `${6 + i}s` }}
            />
          );
        })}
      </g>

      {/* the surface: rippling bright bands */}
      <g className="xr-fog-drift" opacity="0.55">
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={i}
            d={`M-200 ${18 + i * 16} ${Array.from({ length: 30 }, (_, k) => `Q${-200 + k * 100 + 50} ${18 + i * 16 + (k % 2 ? 9 : -9)} ${-100 + k * 100} ${18 + i * 16}`).join(" ")}`}
            stroke="#f0fdfa"
            strokeOpacity={0.5 - i * 0.06}
            strokeWidth={6 - i * 0.6}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* a loose school of fish */}
      <g className="xr-reef-school">
        {FISH.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y}) scale(${f.s})`} opacity={f.o}>
            <ellipse cx="0" cy="0" rx="9" ry="4" fill={f.gold ? "#fbbf24" : "#1e3a5f"} />
            <path d="M8 0 L15 -4 L15 4Z" fill={f.gold ? "#f59e0b" : "#1e3a5f"} />
          </g>
        ))}
      </g>

      {/* bubbles drifting up */}
      {BUBBLES.map((b, i) => (
        <circle
          key={i}
          className="xr-reef-bubble"
          cx={b.x}
          cy={H + 20}
          r={b.rr}
          fill="none"
          stroke="#e0f2fe"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          style={{ animationDuration: `${b.dur}s`, animationDelay: `-${b.delay}s` }}
        />
      ))}

      <rect y="640" width={W} height="360" fill={`url(#${p}-floor)`} />

      {/* coral bed */}
      {CORALS.map((c, i) => (
        <g key={i} filter={c.far ? `url(#${p}-blur)` : undefined} opacity={c.far ? 0.55 : 0.95}>
          <g className="xr-reef-sway" style={{ animationDuration: `${c.dur}s`, animationDelay: `-${c.delay}s`, transformOrigin: `${c.x}px ${c.base}px` }}>
            {c.segs.map((s, k) => (
              <path key={k} d={s.d} stroke={c.c[0]} strokeWidth={s.w} strokeLinecap="round" fill="none" />
            ))}
            {c.segs.map((s, k) =>
              s.w < 3.5 ? <path key={`t${k}`} d={s.d} stroke={c.c[1]} strokeWidth={s.w * 0.5} strokeLinecap="round" fill="none" opacity="0.8" /> : null,
            )}
          </g>
        </g>
      ))}
      {/* a few damselfish over the reef */}
      {[[420, 820], [610, 860], [880, 800], [1150, 870], [1320, 830]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} opacity="0.9">
          <ellipse rx="10" ry="6" fill="#fbbf24" />
          <path d="M9 0 L17 -5 L17 5Z" fill="#f59e0b" />
        </g>
      ))}
    </svg>
  );
}
