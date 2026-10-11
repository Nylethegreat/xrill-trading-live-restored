import { mulberry32 } from "./seeded";

// Bamboo Rain: a green tunnel of bamboo and arching branches over a still
// river path, soft rain falling and ringing on the water. Original SVG;
// rain falls via .xr-rain, ripples via .xr-ripple.
const W = 1600, H = 1000;
const r = mulberry32(8801);
const STALKS = Array.from({ length: 46 }, (_, i) => {
  const left = i % 2 === 0;
  const depth = r();
  const x = left ? 40 + r() * 560 * (0.4 + depth) : W - 40 - r() * 560 * (0.4 + depth);
  return { x, w: 6 + depth * 18, lean: (left ? 1 : -1) * (20 + r() * 80), c: depth > 0.6 ? "#0b2416" : depth > 0.3 ? "#123a24" : "#1d5134", o: 0.65 + depth * 0.35, depth };
}).sort((a, b) => a.depth - b.depth);
const DROPS = Array.from({ length: 220 }, () => ({ x: r() * W, y: r() * H, l: 14 + r() * 24, d: 0.9 + r() * 1.4, del: r() * 2 }));
const RINGS = Array.from({ length: 22 }, () => ({ x: 560 + r() * 480, y: 760 + r() * 220, d: 1.8 + r() * 2.4, del: r() * 3 }));

export default function BambooRainTexture({ className = "", idPrefix = "bamboo" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="55%" r="70%">
          <stop offset="0%" stopColor="#7fb89a" />
          <stop offset="30%" stopColor="#2f6b4c" />
          <stop offset="75%" stopColor="#0c2a1b" />
          <stop offset="100%" stopColor="#04110a" />
        </radialGradient>
        <linearGradient id={`${p}-river`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd3bb" />
          <stop offset="100%" stopColor="#1d4a3a" />
        </linearGradient>
        <filter id={`${p}-mist`}><feGaussianBlur stdDeviation="22" /></filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      <ellipse cx="800" cy="540" rx="260" ry="120" fill="#cfe9dc" opacity="0.35" filter={`url(#${p}-mist)`} />
      {/* river path narrowing into the distance */}
      <path d={`M790 560 L810 560 L1180 ${H} L420 ${H} Z`} fill={`url(#${p}-river)`} opacity="0.85" />
      <path d={`M790 560 L810 560 L1180 ${H} L420 ${H} Z`} fill="#000" opacity="0.15" />
      {/* banks */}
      <path d={`M0 ${H} L0 760 Q 300 700 790 560 L420 ${H} Z`} fill="#081a10" />
      <path d={`M${W} ${H} L${W} 760 Q 1300 700 810 560 L1180 ${H} Z`} fill="#081a10" />
      {/* bamboo + arching branches */}
      {STALKS.map((s, i) => (
        <g key={i} opacity={s.o}>
          <path d={`M${s.x} ${H} Q ${s.x + s.lean * 0.4} 500 ${s.x + s.lean} -20`} stroke={s.c} strokeWidth={s.w} fill="none" />
          {[0.25, 0.45, 0.65, 0.82].map((u) => {
            // point on the stalk's quadratic curve, so the node sits on the stalk
            const x = (1 - u) ** 2 * s.x + 2 * (1 - u) * u * (s.x + s.lean * 0.4) + u * u * (s.x + s.lean);
            const y = (1 - u) ** 2 * H + 2 * (1 - u) * u * 500 + u * u * -20;
            return <line key={u} x1={x - s.w * 0.6} y1={y} x2={x + s.w * 0.6} y2={y} stroke="#04110a" strokeWidth="2" />;
          })}
        </g>
      ))}
      <path d="M0 120 Q 400 260 790 420 Q 1200 260 1600 120 L1600 0 L0 0 Z" fill="#06180e" opacity="0.85" />
      {/* rain */}
      <g stroke="#d1fae5" strokeWidth="1.2" opacity="0.35">
        {DROPS.map((d, i) => (
          <line key={i} className="xr-rain" x1={d.x} y1={d.y} x2={d.x - 3} y2={d.y + d.l} style={{ animationDuration: `${d.d}s`, animationDelay: `-${d.del}s` }} />
        ))}
      </g>
      <g fill="none" stroke="#ecfdf5" strokeWidth="1.2">
        {RINGS.map((g, i) => (
          <ellipse key={i} className="xr-ripple" cx={g.x} cy={g.y} rx="14" ry="4" style={{ animationDuration: `${g.d}s`, animationDelay: `-${g.del}s` }} />
        ))}
      </g>
    </svg>
  );
}
