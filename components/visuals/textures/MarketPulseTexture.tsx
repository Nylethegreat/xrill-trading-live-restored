// Full-bleed decorative background: deep-blue market data in motion --
// out-of-focus bokeh lights, faint floating price numbers, a cyan volume
// histogram and two smooth glowing curves (ice-blue and orange) with
// bright nodes at their turning points. Original artwork, pure inline SVG.
// All blur lives in the static layer; the animated layer only moves two
// small glowing dots along the curves and breathes a few bars.

const W = 1600;
const H = 1000;
const MID = 560;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(4567);

const BOKEH = Array.from({ length: 16 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 14 + rand() * 38,
  color: ["#93c5fd", "#fde68a", "#e0f2fe", "#60a5fa"][Math.floor(rand() * 4)],
  o: 0.25 + rand() * 0.45,
}));

const NUMBERS = Array.from({ length: 18 }, () => ({
  x: rand() * W,
  y: 120 + rand() * 760,
  v: String(Math.floor(1000000 + rand() * 8999999)),
  s: 12 + rand() * 12,
  o: 0.12 + rand() * 0.22,
}));

const BARS = Array.from({ length: 58 }, (_, i) => ({
  x: 160 + i * 22,
  up: 20 + rand() * 160 * Math.sin((i / 58) * Math.PI) + rand() * 40,
  down: rand() * 60,
}));

// Smooth curves as cubic beziers through control points.
const BLUE = "M60,520 C180,420 240,760 340,700 S470,360 560,420 S700,690 800,650 S950,300 1040,260 S1180,560 1260,520 S1420,230 1560,300";
const ORANGE = "M40,560 C150,460 230,300 300,380 S420,760 520,700 S640,480 720,520 S860,700 960,660 S1100,360 1180,420 S1340,800 1480,720";
const NODES = [
  { x: 340, y: 700, c: "#e0f2fe" },
  { x: 560, y: 420, c: "#e0f2fe" },
  { x: 1040, y: 260, c: "#e0f2fe" },
  { x: 1260, y: 520, c: "#e0f2fe" },
  { x: 300, y: 380, c: "#fde68a" },
  { x: 520, y: 700, c: "#fde68a" },
  { x: 960, y: 660, c: "#fde68a" },
  { x: 1180, y: 420, c: "#fde68a" },
];

export default function MarketPulseTexture({ className = "", idPrefix = "pulse" }: { className?: string; idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <radialGradient id={id("bg")} cx="55%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#0d2a6b" />
            <stop offset="60%" stopColor="#061436" />
            <stop offset="100%" stopColor="#030a1f" />
          </radialGradient>
          <linearGradient id={id("bar")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.25" />
          </linearGradient>
          {/* Soft discs via radial gradients -- no blur filters anywhere in
              this texture, so it never has to re-rasterize a blur. */}
          {["#93c5fd", "#fde68a", "#e0f2fe", "#60a5fa"].map((c) => (
            <radialGradient key={c} id={id(`bokeh-${c.slice(1)}`)}>
              <stop offset="0%" stopColor={c} stopOpacity="0.9" />
              <stop offset="60%" stopColor={c} stopOpacity="0.35" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id={id("nodeBlue")}>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("nodeGold")}>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fde68a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("vignette")} cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="#030a1f" stopOpacity="0" />
            <stop offset="100%" stopColor="#030a1f" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill={`url(#${id("bg")})`} />

        {/* faint horizontal scan lines */}
        <g stroke="#60a5fa" strokeOpacity="0.08">
          {Array.from({ length: 30 }, (_, i) => (
            <line key={i} x1="0" y1={200 + i * 14} x2={W} y2={200 + i * 14} />
          ))}
        </g>

        <g fontFamily="ui-monospace, monospace" fill="#93c5fd">
          {NUMBERS.map((n, i) => (
            <text key={i} x={n.x.toFixed(0)} y={n.y.toFixed(0)} fontSize={n.s.toFixed(0)} opacity={n.o.toFixed(2)}>
              {n.v}
            </text>
          ))}
        </g>

        <g>
          {BOKEH.map((b, i) => (
            <circle
              key={i}
              cx={b.x.toFixed(0)}
              cy={b.y.toFixed(0)}
              r={(b.r * 1.4).toFixed(0)}
              fill={`url(#${id(`bokeh-${b.color.slice(1)}`)})`}
              opacity={b.o.toFixed(2)}
            />
          ))}
        </g>

        {/* volume histogram around the midline */}
        <g fill={`url(#${id("bar")})`}>
          {BARS.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={MID - b.up} width="12" height={b.up} />
              <rect x={b.x} y={MID} width="12" height={b.down} opacity="0.5" />
            </g>
          ))}
        </g>

        {/* glowing curves + nodes */}
        {/* "glow" = wide faint strokes under the crisp line */}
        <g fill="none" strokeLinecap="round">
          <path d={BLUE} stroke="#60a5fa" strokeWidth="18" opacity="0.08" />
          <path d={BLUE} stroke="#93c5fd" strokeWidth="8" opacity="0.18" />
          <path d={BLUE} stroke="#e0f2fe" strokeWidth="2.5" opacity="0.95" />
          <path d={ORANGE} stroke="#f97316" strokeWidth="18" opacity="0.1" />
          <path d={ORANGE} stroke="#fb923c" strokeWidth="8" opacity="0.22" />
          <path d={ORANGE} stroke="#fdba74" strokeWidth="3" opacity="0.95" />
        </g>
        {NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="16" fill={`url(#${id(n.c === "#fde68a" ? "nodeGold" : "nodeBlue")})`} />
        ))}

        <rect width={W} height={H} fill={`url(#${id("vignette")})`} />
      </svg>

      {/* Moving parts in their own filter-free layer. */}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" width="100%" height="100%">
        {[
          { d: BLUE, c: "#ffffff", dur: "14s" },
          { d: ORANGE, c: "#fff1d6", dur: "17s" },
        ].map((m, i) => (
          <g key={i}>
            <circle r="12" fill={m.c} opacity="0.25">
              <animateMotion dur={m.dur} repeatCount="indefinite" path={m.d} />
            </circle>
            <circle r="4.5" fill={m.c}>
              <animateMotion dur={m.dur} repeatCount="indefinite" path={m.d} />
            </circle>
          </g>
        ))}
        <g fill="#e0f2fe" opacity="0.5">
          {BARS.filter((_, i) => i % 7 === 3).map((b, i) => (
            <rect key={i} x={b.x} y={MID - b.up} width="12" height="3">
              <animate attributeName="opacity" values="0.2;1;0.2" dur={`${3 + i}s`} repeatCount="indefinite" />
            </rect>
          ))}
        </g>
      </svg>
    </div>
  );
}
