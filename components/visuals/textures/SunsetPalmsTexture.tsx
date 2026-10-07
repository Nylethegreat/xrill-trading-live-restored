// Sunset Palms: golden hour down a long street. Two rows of buildings run
// to a vanishing point, the sun sits low and blinding between them, palms
// line both curbs and the road catches the glow. Original SVG art (inspired
// by city-street "sun in the canyon" sunsets, no photo used).
//
// Performance: no blur filters. Glow comes from radial gradients; the only
// motion is a slow sun "breath" (opacity) and palms swaying (transform),
// each on its own small element so nothing else repaints.

const W = 1600;
const H = 1000;
const VX = 800; // vanishing point
const VY = 560; // horizon

// Buildings on each side as quads toward the vanishing point.
// near edge x, top y at the near edge, how far along the street (0..1) it ends.
const LEFT = [
  { x: 0, top: 40, end: 0.42, shade: "#5a2a17" },
  { x: 250, top: 230, end: 0.62, shade: "#6e3418" },
  { x: 430, top: 340, end: 0.8, shade: "#83401b" },
  { x: 560, top: 410, end: 0.84, shade: "#9a4d1f" },
];
const RIGHT = [
  { x: 1600, top: 0, end: 0.4, shade: "#4d2415" },
  { x: 1340, top: 210, end: 0.6, shade: "#602d17" },
  { x: 1170, top: 330, end: 0.78, shade: "#76391a" },
  { x: 1040, top: 400, end: 0.84, shade: "#8d461d" },
];

// Point on the line from (x, y) toward the vanishing point, t = 0..1.
function towardV(x: number, y: number, t: number): [number, number] {
  return [x + (VX - x) * t, y + (VY - y) * t];
}

function building(b: { x: number; top: number; end: number; shade: string }, side: "l" | "r", i: number) {
  const ground = H;
  const [fx, fTop] = towardV(b.x, b.top, b.end);
  const [, fGround] = towardV(b.x, ground, b.end);
  const pts = `${b.x},${b.top} ${fx},${fTop} ${fx},${fGround} ${b.x},${ground}`;
  // window rows along the facade
  const rows = 6;
  const windows = Array.from({ length: rows * 5 }, (_, k) => {
    const r = Math.floor(k / 5);
    const c = k % 5;
    const t = 0.08 + c * (b.end / 5.6);
    const yFrac = 0.12 + r * 0.12;
    const [wx, wyTop] = towardV(b.x, b.top, t);
    const [, wyGround] = towardV(b.x, ground, t);
    const wy = wyTop + (wyGround - wyTop) * yFrac;
    const size = Math.max(3, 16 * (1 - t));
    const lit = (k * 7 + i * 3) % 5 === 0;
    return (
      <rect
        key={k}
        x={side === "l" ? wx : wx - size}
        y={wy}
        width={size * 0.8}
        height={size}
        fill={lit ? "#ffcf7a" : "#1a0c08"}
        opacity={lit ? 0.75 : 0.45}
      />
    );
  });
  return (
    <g key={`${side}${i}`}>
      <polygon points={pts} fill={b.shade} />
      {windows}
    </g>
  );
}

// Palms along each curb, smaller toward the horizon.
const PALM_T = [0.05, 0.3, 0.5, 0.65, 0.76];

function Palm({ x, y, s, sway, delay }: { x: number; y: number; s: number; sway: boolean; delay: number }) {
  const h = 420 * s;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* trunk: gently curved */}
      <path d={`M0 0 C ${-12 * s} ${-h * 0.4}, ${14 * s} ${-h * 0.7}, ${6 * s} ${-h}`} stroke="#1a0b06" strokeWidth={14 * s} fill="none" strokeLinecap="round" />
      {/* position on an outer group; the sway (a CSS transform) on an inner
          one, since a CSS transform would replace the SVG transform attribute */}
      <g transform={`translate(${6 * s} ${-h})`}>
      <g
        className={sway ? "motion-safe:animate-[palm-sway_7s_ease-in-out_infinite]" : undefined}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%", animationDelay: `${delay}s` }}
      >
        {[-150, -110, -70, -30, 10, 50, 95, 140, 180].map((a, k) => {
          const len = (130 + (k % 3) * 25) * s;
          const rad = (a * Math.PI) / 180;
          const ex = Math.cos(rad) * len;
          const ey = Math.sin(rad) * len * 0.55 + len * 0.35;
          return (
            <path
              key={k}
              d={`M0 0 Q ${ex * 0.5} ${ey * 0.2 - 30 * s}, ${ex} ${ey}`}
              stroke="#140804"
              strokeWidth={10 * s}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
        <circle r={12 * s} fill="#140804" />
      </g>
      </g>
    </g>
  );
}

export default function SunsetPalmsTexture({ className = "", idPrefix = "sunset", still = false }: { className?: string; idPrefix?: string; still?: boolean }) {
  const p = idPrefix;
  const palms = [
    ...PALM_T.map((t, i) => {
      const [x, y] = towardV(330, H, t);
      return { x: x - 40 * (1 - t), y, s: 1 - t * 1.05, delay: i * 0.8 };
    }),
    ...PALM_T.map((t, i) => {
      const [x, y] = towardV(1270, H, t);
      return { x: x + 40 * (1 - t), y, s: 1 - t * 1.05, delay: i * 0.8 + 0.4 };
    }),
  ].filter((pl) => pl.s > 0.12);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b1a3a" />
          <stop offset="35%" stopColor="#a8432c" />
          <stop offset="58%" stopColor="#f59e42" />
          <stop offset="70%" stopColor="#fde2a6" />
          <stop offset="100%" stopColor="#c2672f" />
        </linearGradient>
        <radialGradient id={`${p}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff1b8" />
          <stop offset="18%" stopColor="#ffc95c" />
          <stop offset="45%" stopColor="#ff9a3c" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-haze`} cx="0.5" cy="0.56" r="0.6">
          <stop offset="0%" stopColor="#ffd38a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd38a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6b065" />
          <stop offset="25%" stopColor="#7a3b1e" />
          <stop offset="100%" stopColor="#1e0d07" />
        </linearGradient>
        <linearGradient id={`${p}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3cf" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff3cf" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-sky)`} />

      {/* the sun, low and blinding at the end of the street */}
      <g className={still ? undefined : "motion-safe:animate-[sun-breathe_6s_ease-in-out_infinite]"} style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}>
        <circle cx={VX} cy={VY - 95} r="420" fill={`url(#${p}-sun)`} />
      </g>
      <circle cx={VX} cy={VY - 95} r="72" fill="#ffe28f" />
      <circle cx={VX} cy={VY - 95} r="110" fill="#ffc35a" opacity="0.45" />

      {/* road with a warm sheen pointing at the sun */}
      <polygon points={`${VX - 6},${VY} ${VX + 6},${VY} 1270,${H} 330,${H}`} fill={`url(#${p}-road)`} />
      <polygon points={`${VX - 3},${VY} ${VX + 3},${VY} 900,${H} 700,${H}`} fill={`url(#${p}-sheen)`} opacity="0.55" />
      {/* crosswalk stripes near the viewer */}
      {Array.from({ length: 9 }, (_, k) => {
        const x = 420 + k * 90;
        return <polygon key={k} points={`${x},${H - 70} ${x + 46},${H - 70} ${x + 52},${H - 30} ${x - 6},${H - 30}`} fill="#fde7c2" opacity="0.35" />;
      })}

      {LEFT.map((b, i) => building(b, "l", i))}
      {RIGHT.map((b, i) => building(b, "r", i))}

      {/* golden haze over everything near the horizon */}
      <rect width={W} height={H} fill={`url(#${p}-haze)`} />

      {palms.map((pl, i) => (
        <Palm key={i} x={pl.x} y={pl.y} s={pl.s} sway={!still} delay={pl.delay} />
      ))}

      <style>{`
        @keyframes sun-breathe { 0%,100% { opacity: .85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
        @keyframes palm-sway { 0%,100% { transform: rotate(-2.5deg); } 50% { transform: rotate(2.5deg); } }
      `}</style>
    </svg>
  );
}
