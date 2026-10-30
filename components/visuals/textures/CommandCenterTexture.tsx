import { mulberry32 } from "./seeded";

// Command Center: a holographic trading HUD wall in deep navy -- bracketed
// panels with a spinning core ring, a dot-matrix globe band with blinking
// nodes and arcs, candlesticks over volume, donut gauges, a wireframe cube,
// and a lone trader standing in front of it all. Original SVG. Motion via
// the .xr-cc-* classes in app/globals.css; still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(5501);

const STARS = Array.from({ length: 140 }, () => ({ x: r() * W, y: r() * H, rr: 0.4 + r() * 1.1, o: 0.15 + r() * 0.5 }));

// Dot-matrix "globe" band: a lat/long grid of dots, brighter where land-ish
// noise is high, so it reads as a map without tracing any real map.
const GLOBE = (() => {
  const dots: { x: number; y: number; o: number }[] = [];
  for (let gy = 0; gy < 15; gy++) {
    for (let gx = 0; gx < 70; gx++) {
      const x = 330 + gx * 13.5;
      const y = 405 + gy * 11;
      const n = Math.sin(gx * 0.31) + Math.cos(gy * 0.55 + gx * 0.09) + Math.sin(gx * 0.07 + gy * 0.4) * 1.2;
      dots.push({ x, y, o: n > 0.9 ? 0.75 : n > 0.2 ? 0.28 : 0.08 });
    }
  }
  return dots;
})();
const NODES = Array.from({ length: 14 }, () => ({ x: 360 + r() * 880, y: 415 + r() * 140, d: (r() * 3).toFixed(2) }));
const ARCS = Array.from({ length: 6 }, (_, i) => {
  const a = NODES[i * 2], b = NODES[i * 2 + 1];
  return { a, b, mx: (a.x + b.x) / 2, my: Math.min(a.y, b.y) - 50 - r() * 40 };
});

// Candles over volume for the bottom panel: a random walk.
const CANDLES = (() => {
  const out: { x: number; o: number; c: number; h: number; l: number; v: number; d: string }[] = [];
  let p = 740;
  for (let i = 0; i < 46; i++) {
    const o = p;
    const c = o + (r() - 0.5) * 52;
    const h = Math.min(o, c) - 4 - r() * 18;
    const l = Math.max(o, c) + 4 + r() * 18;
    out.push({ x: 352 + i * 19.5, o, c, h, l, v: 20 + r() * 70, d: (r() * 4).toFixed(2) });
    p = Math.max(660, Math.min(800, c));
  }
  return out;
})();

const LEFT_BARS = [150, 120, 165, 95, 135];
const ICON_GRID = Array.from({ length: 24 }, (_, i) => ({ x: 1328 + (i % 4) * 46, y: 92 + Math.floor(i / 4) * 40, k: i % 5, d: (r() * 3).toFixed(2) }));
const TICK = Array.from({ length: 12 }, (_, i) => ({ y: 700 + i * 22, w: 30 + r() * 90, up: r() > 0.4 }));

function Brackets({ x, y, w, h, s = 18 }: { x: number; y: number; w: number; h: number; s?: number }) {
  return (
    <path
      d={`M${x} ${y + s}V${y}H${x + s} M${x + w - s} ${y}H${x + w}V${y + s} M${x + w} ${y + h - s}V${y + h}H${x + w - s} M${x + s} ${y + h}H${x}V${y + h - s}`}
      fill="none"
      stroke="#cfe8ff"
      strokeWidth="3"
      opacity="0.85"
    />
  );
}

export default function CommandCenterTexture({ className = "", idPrefix = "cc" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="55%" r="75%">
          <stop offset="0%" stopColor="#13284a" />
          <stop offset="55%" stopColor="#0a1530" />
          <stop offset="100%" stopColor="#040814" />
        </radialGradient>
        <linearGradient id={`${p}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7cc4ff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`${p}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe3ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#bfe3ff" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`${p}-scan`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd8ff" stopOpacity="0" />
          <stop offset="50%" stopColor="#9fd8ff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#9fd8ff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${p}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.rr} fill="#dbeafe" opacity={s.o} />
      ))}
      <rect x="40" y="40" width="1520" height="920" fill="none" stroke="#5ea8ff" strokeOpacity="0.35" strokeWidth="2" />

      {/* Left column: bar list, donut gauges, waveform */}
      <Brackets x={70} y={70} w={220} h={420} />
      {LEFT_BARS.map((w, i) => (
        <rect key={i} className="xr-cc-bar-x" style={{ animationDelay: `${i * 0.6}s` }} x={95} y={95 + i * 26} width={w} height={12} fill="#e8f2ff" opacity="0.85" />
      ))}
      {[260, 345, 430].map((cy, i) => (
        <g key={cy} transform={`translate(140 ${cy})`}>
          <circle r="34" fill="none" stroke="#e8f2ff" strokeOpacity="0.2" strokeWidth="14" />
          <circle
            className="xr-cc-spin"
            style={{ animationDuration: `${18 + i * 7}s` }}
            r="34"
            fill="none"
            stroke="#e8f2ff"
            strokeWidth="14"
            strokeDasharray={`${70 + i * 40} 220`}
            opacity="0.85"
          />
          {Array.from({ length: 6 }, (_, j) => (
            <rect key={j} x={60 + j * 10} y={-18 + ((j * 7 + i * 5) % 20)} width="6" height={30 - ((j * 7 + i * 5) % 20)} fill="#e8f2ff" opacity="0.7" />
          ))}
        </g>
      ))}
      <Brackets x={70} y={520} w={220} h={410} />
      <path
        className="xr-cc-blink"
        d={Array.from({ length: 60 }, (_, i) => `${i === 0 ? "M" : "L"}${90 + i * 3.1} ${610 + Math.sin(i * 0.55) * 22 * Math.sin(i * 0.11 + 1)}`).join(" ")}
        fill="none"
        stroke="#e8f2ff"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <path
        d={Array.from({ length: 60 }, (_, i) => `${i === 0 ? "M" : "L"}${90 + i * 3.1} ${610 + Math.cos(i * 0.42) * 18}`).join(" ")}
        fill="none"
        stroke="#7cc4ff"
        strokeWidth="1.2"
        opacity="0.6"
      />
      {TICK.map((t, i) => (
        <g key={i}>
          <rect x={95} y={t.y} width={t.w} height={10} fill={t.up ? "#e8f2ff" : "#7cc4ff"} opacity={t.up ? 0.75 : 0.45} />
          <rect x={95 + t.w + 6} y={t.y} width={8} height={10} fill={t.up ? "#4ade80" : "#f87171"} opacity="0.8" />
        </g>
      ))}

      {/* Top center: spinning core ring with data rails */}
      <Brackets x={330} y={70} w={940} h={260} />
      <g transform="translate(800 200)" filter={`url(#${p}-glow)`}>
        <circle className="xr-cc-spin" r="96" fill="none" stroke="#e8f2ff" strokeWidth="14" strokeDasharray="44 14" opacity="0.9" />
        <circle className="xr-cc-spin-rev" r="74" fill="none" stroke="#cfe8ff" strokeWidth="3" strokeDasharray="6 10" opacity="0.8" />
        <circle r="58" fill="none" stroke="#e8f2ff" strokeWidth="2" opacity="0.7" />
        <circle className="xr-cc-spin" style={{ animationDuration: "9s" }} r="120" fill="none" stroke="#7cc4ff" strokeWidth="2" strokeDasharray="120 640" opacity="0.8" />
        <text y="8" textAnchor="middle" fill="#e8f2ff" fontFamily="monospace" fontSize="22" fontWeight="bold" opacity="0.85">
          XRILL
        </text>
      </g>
      {[-1, 1].map((side) => (
        <g key={side}>
          {[150, 175, 200, 225, 250].map((y, i) => (
            <g key={y}>
              <line x1={800 + side * 140} y1={y} x2={800 + side * (300 + i * 30)} y2={y} stroke="#cfe8ff" strokeOpacity="0.45" strokeWidth="1.5" />
              <circle
                className="xr-cc-blink"
                style={{ animationDelay: `${i * 0.5 + (side > 0 ? 0.25 : 0)}s` }}
                cx={800 + side * (300 + i * 30)}
                cy={y}
                r="4"
                fill="#7dd3fc"
              />
            </g>
          ))}
          {[0, 1, 2].map((k) => (
            <g
              key={k}
              className="xr-cc-spin"
              style={{ animationDuration: `${7 + k * 3}s`, transformOrigin: `${800 + side * (220 + k * 95)}px ${130 + k * 55}px` }}
            >
              <circle cx={800 + side * (220 + k * 95)} cy={130 + k * 55} r={12 - k * 2} fill="none" stroke="#67e8f9" strokeWidth="6" strokeDasharray="5 4" />
            </g>
          ))}
        </g>
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <rect key={i} x={380 + (i % 6) * 18} y={110 + Math.floor(i / 6) * 16} width="12" height="10" fill="#e8f2ff" opacity="0.75" />
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <rect key={i} x={1110 + (i % 6) * 18} y={250 + Math.floor(i / 6) * 16} width="12" height="10" fill="#e8f2ff" opacity="0.75" />
      ))}

      {/* Right column: icon grid, wireframe cube, readouts */}
      <Brackets x={1300} y={70} w={230} h={260} />
      {ICON_GRID.map((ic, i) => (
        <g key={i}>
          <rect x={ic.x} y={ic.y} width="32" height="30" rx="5" fill="none" stroke="#e8f2ff" strokeOpacity="0.75" strokeWidth="2" />
          {ic.k === 0 && <path d={`M${ic.x + 8} ${ic.y + 20}l6 -7l5 4l6 -9`} fill="none" stroke="#e8f2ff" strokeWidth="2" />}
          {ic.k === 1 && <circle className="xr-cc-blink" style={{ animationDelay: `${ic.d}s` }} cx={ic.x + 16} cy={ic.y + 15} r="6" fill="#7dd3fc" />}
          {ic.k === 2 && [0, 1, 2].map((b) => <rect key={b} x={ic.x + 8 + b * 6} y={ic.y + 20 - b * 5} width="4" height={4 + b * 5} fill="#e8f2ff" />)}
          {ic.k === 3 && <path d={`M${ic.x + 8} ${ic.y + 15}h16M${ic.x + 16} ${ic.y + 7}v16`} stroke="#e8f2ff" strokeWidth="2" />}
          {ic.k === 4 && <rect x={ic.x + 9} y={ic.y + 9} width="14" height="12" fill="none" stroke="#e8f2ff" strokeWidth="2" />}
        </g>
      ))}
      <Brackets x={1300} y={360} w={230} h={260} />
      <g className="xr-cc-float" stroke="#e8f2ff" strokeWidth="2" fill="#dbeafe" fillOpacity="0.08" opacity="0.9">
        <path d="M1360 440 L1430 410 L1490 440 L1420 470Z" />
        <path d="M1360 440 L1360 540 L1420 570 L1420 470Z" fillOpacity="0.16" />
        <path d="M1420 470 L1490 440 L1490 540 L1420 570Z" fillOpacity="0.04" />
        <path d="M1395 470 L1395 520 L1420 532 L1420 482Z" fill="#040814" fillOpacity="0.9" stroke="none" />
      </g>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={1325 + (i % 6) * 16} y={585 + Math.floor(i / 6) * 13} width="11" height="9" fill="#e8f2ff" opacity="0.7" />
      ))}
      <Brackets x={1300} y={650} w={230} h={280} />
      <rect x="1310" y="660" width="210" height="260" fill="#9fd8ff" opacity="0.1" />
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => {
          const x = 1330 + col * 64;
          const y = 690 + row * 58;
          return (
            <g key={`${row}-${col}`} opacity="0.85">
              <circle cx={x + 10} cy={y + 8} r="6" fill="#e8f2ff" />
              <path d={`M${x + 3} ${y + 34} L${x + 5} ${y + 16} H${x + 15} L${x + 17} ${y + 34}`} fill="#e8f2ff" />
              <circle className="xr-cc-blink" style={{ animationDelay: `${(row * 3 + col) * 0.3}s` }} cx={x + 40} cy={y + 18} r="9" fill="none" stroke="#e8f2ff" strokeWidth="3" />
            </g>
          );
        })
      )}

      {/* Center band: dot-matrix globe with blinking nodes and arcs */}
      <rect x="320" y="385" width="960" height="190" fill={`url(#${p}-band)`} />
      <Brackets x={320} y={385} w={960} h={190} />
      {GLOBE.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="2.4" fill="#e8f2ff" opacity={d.o} />
      ))}
      {ARCS.map((a, i) => (
        <path
          key={i}
          className="xr-cc-dash"
          style={{ animationDelay: `${i * 0.7}s` }}
          d={`M${a.a.x} ${a.a.y} Q${a.mx} ${a.my} ${a.b.x} ${a.b.y}`}
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="1.6"
          strokeDasharray="6 8"
          opacity="0.75"
        />
      ))}
      {NODES.map((n, i) => (
        <g key={i}>
          <circle className="xr-cc-ping" style={{ animationDelay: `${n.d}s` }} cx={n.x} cy={n.y} r="10" fill="none" stroke="#bae6fd" strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="3.5" fill="#f0f9ff" />
        </g>
      ))}
      <rect className="xr-cc-scan" x="320" y="385" width="960" height="40" fill={`url(#${p}-scan)`} />

      {/* Bottom center: candlesticks over volume */}
      <Brackets x={320} y={610} w={960} h={320} />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={340 + i * 72} y1="630" x2={340 + i * 72} y2="915" stroke="#cfe8ff" strokeOpacity="0.12" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`h${i}`} x1="335" y1={640 + i * 38} x2="1265" y2={640 + i * 38} stroke="#cfe8ff" strokeOpacity="0.12" />
      ))}
      {CANDLES.map((c, i) => {
        const up = c.c < c.o;
        return (
          <g key={i}>
            <line x1={c.x + 6} y1={c.h} x2={c.x + 6} y2={c.l} stroke={up ? "#86efac" : "#fca5a5"} strokeWidth="1.5" opacity="0.85" />
            <rect x={c.x} y={Math.min(c.o, c.c)} width="12" height={Math.max(3, Math.abs(c.c - c.o))} fill={up ? "#4ade80" : "#f87171"} opacity="0.85" />
            <rect
              className="xr-cc-bar"
              style={{ animationDelay: `${c.d}s` }}
              x={c.x - 1}
              y={915 - c.v}
              width="12"
              height={c.v}
              fill="#e8f2ff"
              opacity="0.55"
            />
          </g>
        );
      })}

      {/* Floor glow and the lone trader */}
      <ellipse cx="800" cy="975" rx="420" ry="40" fill={`url(#${p}-floor)`} />
      <g fill="#02050d">
        <circle cx="800" cy="780" r="17" />
        <path d="M778 800 Q800 790 822 800 L832 872 L822 874 L818 830 L816 900 L812 972 L802 972 L801 905 L799 905 L798 972 L788 972 L784 900 L782 830 L778 874 L768 872Z" />
      </g>
    </svg>
  );
}
