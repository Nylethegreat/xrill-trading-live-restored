// Full-bleed decorative background: a rainy neon arcade alley in one-point
// perspective -- rows of glowing cabinets down both walls, hanging lamps,
// a lit door at the vanishing point under an XRILL neon sign, and a wet
// floor throwing colored reflections back up. Pure inline SVG (geometry is
// computed below, deterministic), with a few SMIL flickers so the screens
// and sign feel alive. Original artwork -- not a copy of any reference.

const W = 1600;
const H = 1000;
const VP_X = 800;
const BACK_L = 640; // back wall left edge
const BACK_R = 960; // back wall right edge
const BACK_TOP = 330;
const BACK_BOTTOM = 560;

// Left wall edges: top runs (0,0) -> (640,330), bottom (0,1000) -> (640,560).
const yTop = (x: number) => (BACK_TOP * x) / BACK_L;
const yBottom = (x: number) => H - ((H - BACK_BOTTOM) * x) / BACK_L;
const at = (x: number, p: number) => yTop(x) + (yBottom(x) - yTop(x)) * p;

// Cabinet slots along the left wall, front to back (perspective spacing).
const SLOTS: [number, number][] = [
  [30, 230],
  [262, 398],
  [420, 502],
  [518, 568],
  [578, 610],
];

const NEON = ["#ff3ea5", "#22d3ee", "#a855f7", "#fbbf24", "#34d399"];

type Pt = [number, number];
const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [W - x, y]);

function cabinet(a: number, b: number) {
  const inset = (b - a) * 0.14;
  const sa = a + inset;
  const sb = b - inset;
  const body: Pt[] = [
    [a, at(a, 0.4)],
    [b, at(b, 0.4)],
    [b, yBottom(b)],
    [a, yBottom(a)],
  ];
  const marquee: Pt[] = [
    [a, at(a, 0.4)],
    [b, at(b, 0.4)],
    [b, at(b, 0.46)],
    [a, at(a, 0.46)],
  ];
  const screen: Pt[] = [
    [sa, at(sa, 0.5)],
    [sb, at(sb, 0.5)],
    [sb, at(sb, 0.66)],
    [sa, at(sa, 0.66)],
  ];
  const panel: Pt[] = [
    [a, at(a, 0.7)],
    [b, at(b, 0.7)],
    [b, at(b, 0.75)],
    [a, at(a, 0.75)],
  ];
  // Reflection of the screen on the wet floor, stretched downward.
  const ha = (yBottom(sa) - at(sa, 0.5)) * 0.9;
  const hb = (yBottom(sb) - at(sb, 0.5)) * 0.9;
  const reflection: Pt[] = [
    [sa, yBottom(sa) + 4],
    [sb, yBottom(sb) + 4],
    [sb, Math.min(H, yBottom(sb) + 4 + hb)],
    [sa, Math.min(H, yBottom(sa) + 4 + ha)],
  ];
  return { body, marquee, screen, panel, reflection };
}

// Floor perspective lines: from points on the back edge out to the front.
const FLOOR_RAYS = Array.from({ length: 13 }, (_, i) => {
  const bx = BACK_L + ((BACK_R - BACK_L) * i) / 12;
  const fx = VP_X + (bx - VP_X) * ((H - 470) / (BACK_BOTTOM - 470));
  return { bx, fx };
});
const FLOOR_ROWS = [576, 598, 628, 668, 724, 800, 905];

const LAMPS = [
  { y: 46, s: 1.6 },
  { y: 176, s: 1 },
  { y: 252, s: 0.62 },
  { y: 298, s: 0.38 },
];

export default function NeonArcadeTexture({
  className = "",
  idPrefix = "arc",
}: {
  className?: string;
  idPrefix?: string;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const cabinets = SLOTS.map(([a, b]) => cabinet(a, b));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <linearGradient id={id("ceiling")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d0b22" />
            <stop offset="100%" stopColor="#1b1446" />
          </linearGradient>
          <linearGradient id={id("wall")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#120f33" />
            <stop offset="100%" stopColor="#231a5c" />
          </linearGradient>
          <linearGradient id={id("floor")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2170" />
            <stop offset="100%" stopColor="#0a0820" />
          </linearGradient>
          <radialGradient id={id("door")} cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor="#a5f3fc" stopOpacity="1" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.55" />
          </radialGradient>
          <radialGradient id={id("haze")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id("cone")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
          </linearGradient>
          {NEON.map((c, i) => (
            <linearGradient key={c} id={id(`refl-${i}`)} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.55" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
          <radialGradient id={id("vignette")} cx="50%" cy="45%" r="75%">
            <stop offset="55%" stopColor="#07080f" stopOpacity="0" />
            <stop offset="100%" stopColor="#07080f" stopOpacity="0.85" />
          </radialGradient>
          <filter id={id("glow")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={id("blur")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* Room shell */}
        <polygon points={poly([[0, 0], [W, 0], [BACK_R, BACK_TOP], [BACK_L, BACK_TOP]])} fill={`url(#${id("ceiling")})`} />
        <polygon points={poly([[0, 0], [BACK_L, BACK_TOP], [BACK_L, BACK_BOTTOM], [0, H]])} fill={`url(#${id("wall")})`} />
        <polygon
          points={poly(mirror([[0, 0], [BACK_L, BACK_TOP], [BACK_L, BACK_BOTTOM], [0, H]]))}
          fill={`url(#${id("wall")})`}
        />
        <rect x={BACK_L} y={BACK_TOP} width={BACK_R - BACK_L} height={BACK_BOTTOM - BACK_TOP} fill="#0b0a24" />
        <polygon points={poly([[0, H], [BACK_L, BACK_BOTTOM], [BACK_R, BACK_BOTTOM], [W, H]])} fill={`url(#${id("floor")})`} />

        {/* Ceiling pipes */}
        <g stroke="#3b2f86" strokeWidth="3" opacity="0.7">
          <line x1="80" y1="42" x2={BACK_L + 20} y2={BACK_TOP + 6} />
          <line x1={W - 80} y1="42" x2={BACK_R - 20} y2={BACK_TOP + 6} />
          <line x1="0" y1="118" x2={W} y2="118" strokeWidth="5" />
        </g>

        {/* Back wall: glowing door under an XRILL neon sign */}
        <ellipse cx={VP_X} cy="500" rx="140" ry="90" fill={`url(#${id("haze")})`} />
        <rect x="768" y="452" width="64" height="108" rx="3" fill={`url(#${id("door")})`} filter={`url(#${id("glow")})`} />
        <rect x="764" y="448" width="72" height="112" rx="4" fill="none" stroke="#67e8f9" strokeWidth="2" opacity="0.8" />
        <text
          x={VP_X}
          y="418"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="36"
          fontWeight="700"
          letterSpacing="6"
          fill="none"
          stroke="#e879f9"
          strokeWidth="1.8"
          filter={`url(#${id("glow")})`}
        >
          XRILL
          <animate attributeName="opacity" values="1;1;0.55;1;0.8;1" keyTimes="0;0.9;0.92;0.94;0.97;1" dur="5s" repeatCount="indefinite" />
        </text>

        {/* Floor grid */}
        <g stroke="#6d5dfc" strokeOpacity="0.16" strokeWidth="1">
          {FLOOR_RAYS.map(({ bx, fx }) => (
            <line key={bx} x1={bx} y1={BACK_BOTTOM} x2={fx} y2={H} />
          ))}
          {FLOOR_ROWS.map((y) => {
            const t = (y - BACK_BOTTOM) / (H - BACK_BOTTOM);
            const half = (BACK_R - BACK_L) / 2 + t * (W / 2 - (BACK_R - BACK_L) / 2);
            return <line key={y} x1={VP_X - half} y1={y} x2={VP_X + half} y2={y} />;
          })}
        </g>

        {/* Wet-floor reflections (blurred, under everything else on the floor) */}
        <g filter={`url(#${id("blur")})`}>
          {cabinets.map((c, i) => (
            <g key={`r-${i}`}>
              <polygon points={poly(c.reflection)} fill={`url(#${id(`refl-${i % NEON.length}`)})`} />
              <polygon points={poly(mirror(c.reflection))} fill={`url(#${id(`refl-${(i + 2) % NEON.length}`)})`} />
            </g>
          ))}
          <ellipse cx={VP_X} cy="640" rx="46" ry="90" fill="#67e8f9" opacity="0.28" />
          {LAMPS.slice(1).map((l) => (
            <ellipse key={`lr-${l.y}`} cx={VP_X} cy={600 + (300 - l.y) * 0.9} rx={70 * l.s} ry={14 * l.s} fill="#fef3c7" opacity="0.14" />
          ))}
        </g>

        {/* Wall neon panels (abstract signs, no real text) */}
        {[
          { a: 60, b: 210, c: NEON[0] },
          { a: 300, b: 385, c: NEON[1] },
          { a: 440, b: 492, c: NEON[2] },
        ].map((s, i) => {
          const pts: Pt[] = [
            [s.a, at(s.a, 0.14)],
            [s.b, at(s.b, 0.14)],
            [s.b, at(s.b, 0.3)],
            [s.a, at(s.a, 0.3)],
          ];
          const colR = NEON[(i + 3) % NEON.length];
          return (
            <g key={`sign-${i}`} filter={`url(#${id("glow")})`} fill="none" strokeWidth="2.2">
              <polygon points={poly(pts)} stroke={s.c} />
              <polygon points={poly(mirror(pts))} stroke={colR} />
              {[0.19, 0.23, 0.26].map((p) => {
                const x1 = s.a + (s.b - s.a) * 0.15;
                const x2 = s.a + (s.b - s.a) * (p === 0.23 ? 0.6 : 0.85);
                return (
                  <g key={p} strokeWidth="1.6" opacity="0.8">
                    <line x1={x1} y1={at(x1, p)} x2={x2} y2={at(x2, p)} stroke={s.c} />
                    <line x1={W - x1} y1={at(x1, p)} x2={W - x2} y2={at(x2, p)} stroke={colR} />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Cabinets, both walls */}
        {cabinets.map((c, i) => {
          const colL = NEON[i % NEON.length];
          const colR = NEON[(i + 2) % NEON.length];
          const durL = `${2.6 + i * 0.7}s`;
          const durR = `${3.1 + i * 0.5}s`;
          return (
            <g key={`cab-${i}`}>
              {[
                { pts: (p: Pt[]) => p, col: colL, dur: durL },
                { pts: mirror, col: colR, dur: durR },
              ].map((side, j) => (
                <g key={j}>
                  <polygon points={poly(side.pts(c.body))} fill="#171238" stroke={side.col} strokeOpacity="0.35" strokeWidth="1.2" />
                  <polygon points={poly(side.pts(c.marquee))} fill={side.col} opacity="0.85" filter={`url(#${id("glow")})`} />
                  <polygon points={poly(side.pts(c.screen))} fill={side.col} opacity="0.75" filter={`url(#${id("glow")})`}>
                    <animate attributeName="opacity" values="0.75;0.9;0.7;0.85;0.75" dur={side.dur} repeatCount="indefinite" />
                  </polygon>
                  <polygon points={poly(side.pts(c.panel))} fill="#2e2672" />
                </g>
              ))}
            </g>
          );
        })}

        {/* Hanging lamps with soft light cones */}
        {LAMPS.map((l) => (
          <g key={`lamp-${l.y}`}>
            <line x1={VP_X} y1={l.y - 40 * l.s} x2={VP_X} y2={l.y} stroke="#2d2566" strokeWidth={2 * l.s} />
            <polygon
              points={poly([
                [VP_X - 16 * l.s, l.y + 8 * l.s],
                [VP_X + 16 * l.s, l.y + 8 * l.s],
                [VP_X + 160 * l.s, l.y + 300 * l.s],
                [VP_X - 160 * l.s, l.y + 300 * l.s],
              ])}
              fill={`url(#${id("cone")})`}
            />
            <path
              d={`M ${VP_X - 26 * l.s} ${l.y + 10 * l.s} L ${VP_X - 10 * l.s} ${l.y} L ${VP_X + 10 * l.s} ${l.y} L ${VP_X + 26 * l.s} ${l.y + 10 * l.s} Z`}
              fill="#1f1a4a"
            />
            <ellipse cx={VP_X} cy={l.y + 10 * l.s} rx={20 * l.s} ry={4 * l.s} fill="#fff7d6" filter={`url(#${id("glow")})`} />
          </g>
        ))}

        {/* Edge darkening so content on top stays readable */}
        <rect width={W} height={H} fill={`url(#${id("vignette")})`} />
      </svg>
    </div>
  );
}
