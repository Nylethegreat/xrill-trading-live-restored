import { mulberry32 } from "./seeded";

// Rain Glass: a dark windowpane at night — distant streetlights blurred
// into soft gold and emerald bokeh orbs, beaded raindrops resting on the
// glass, and a few drops sliding down leaving thin trails. Original SVG.
// Bokeh breathes and drops slide via .xr-* classes, still under reduced
// motion.
const W = 1600, H = 1000;
const r = mulberry32(2689);
const BOKEH_COLORS = ["#fbbf24", "#f59e0b", "#fcd34d", "#34d399", "#10b981", "#fde68a", "#60a5fa"];
const BOKEH = Array.from({ length: 46 }, () => ({
  x: r() * W,
  y: 380 + r() * 560,
  rr: 18 + r() * 70,
  c: BOKEH_COLORS[Math.floor(r() * BOKEH_COLORS.length)],
  o: 0.25 + r() * 0.45,
  dur: 5 + r() * 6,
  delay: r() * 8,
}));
const DROPS = Array.from({ length: 260 }, () => ({ x: r() * W, y: r() * H, rx: 1.5 + r() * 4.5, ry: 0 }))
  .map((d) => ({ ...d, ry: d.rx * (1.05 + r() * 0.35) }));
const SLIDERS = Array.from({ length: 9 }, () => ({ x: 80 + r() * (W - 160), rx: 5 + r() * 3, dur: 9 + r() * 10, delay: r() * 14 }));

export default function RainGlassTexture({ className = "", idPrefix = "rainglass" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040814" />
          <stop offset="55%" stopColor="#0a1530" />
          <stop offset="100%" stopColor="#101b3a" />
        </linearGradient>
        <radialGradient id={`${p}-drop`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="35%" stopColor="#bfdbfe" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0b1530" stopOpacity="0.55" />
        </radialGradient>
        <filter id={`${p}-bokeh`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id={`${p}-far`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      {/* city glow on the horizon */}
      <g filter={`url(#${p}-far)`} opacity="0.55">
        <ellipse cx="400" cy="900" rx="520" ry="160" fill="#b45309" />
        <ellipse cx="1200" cy="920" rx="560" ry="150" fill="#065f46" />
      </g>

      {/* bokeh orbs */}
      <g filter={`url(#${p}-bokeh)`} style={{ mixBlendMode: "screen" }}>
        {BOKEH.map((b, i) => (
          <g key={i} className="xr-breathe" style={{ animationDuration: `${b.dur}s`, animationDelay: `-${b.delay}s` }}>
            <circle cx={b.x} cy={b.y} r={b.rr} fill={b.c} opacity={b.o * 0.55} />
            <circle cx={b.x} cy={b.y} r={b.rr} fill="none" stroke={b.c} strokeWidth="3" opacity={b.o} />
          </g>
        ))}
      </g>

      {/* glass sheen */}
      <rect width={W} height={H} fill="#cbd5e1" opacity="0.025" />

      {/* beaded drops resting on the pane */}
      {DROPS.map((d, i) => (
        <g key={i}>
          <ellipse cx={d.x} cy={d.y + d.ry * 0.3} rx={d.rx} ry={d.ry} fill="#000" opacity="0.25" />
          <ellipse cx={d.x} cy={d.y} rx={d.rx} ry={d.ry} fill={`url(#${p}-drop)`} />
        </g>
      ))}

      {/* drops sliding down, each with a thin trail */}
      {SLIDERS.map((s, i) => (
        <g key={i} className="xr-rain-slide" style={{ animationDuration: `${s.dur}s`, animationDelay: `-${s.delay}s` }}>
          <path d={`M${s.x} -260 Q${s.x + 4} -140 ${s.x} -10`} stroke="#bfdbfe" strokeOpacity="0.22" strokeWidth={s.rx * 0.6} fill="none" strokeLinecap="round" />
          <ellipse cx={s.x} cy="0" rx={s.rx} ry={s.rx * 1.35} fill={`url(#${p}-drop)`} />
        </g>
      ))}
    </svg>
  );
}
