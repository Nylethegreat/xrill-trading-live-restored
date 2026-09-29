// Full-bleed decorative background: an 80s neon night drive -- a highway
// running to the horizon under a glowing neon triangle, cyan headlight
// streaks rushing toward you on the left, pink/red taillight streaks
// pulling away on the right, a dark skyline on the horizon. Original
// artwork, pure inline SVG. The streak glow is a static blurred layer;
// only thin crisp dashes animate (stroke-dashoffset), so it stays light.

const W = 1600;
const H = 1000;
const VP_X = 800;
const VP_Y = 480;

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
const rand = mulberry32(1983);

// Light-trail rays: from just off the vanishing point out to the bottom
// edge. Left = oncoming headlights (cyan/blue), right = taillights (pink/red).
const RAYS = Array.from({ length: 34 }, (_, i) => {
  const left = i < 17;
  const k = left ? i / 16 : (i - 17) / 16;
  const endX = left ? -700 + k * 1350 : 900 + k * 1400;
  const startX = VP_X + (left ? -18 - k * 20 : 18 + k * 20);
  const colors = left ? ["#67e8f9", "#38bdf8", "#60a5fa", "#a5f3fc"] : ["#ff3ea5", "#f43f5e", "#fb7185", "#e879f9"];
  return {
    d: `M${startX.toFixed(1)},${VP_Y + 6} L${endX.toFixed(1)},${H + 20}`,
    color: colors[Math.floor(rand() * colors.length)],
    width: 1 + rand() * 2.2,
    dash: `${60 + Math.floor(rand() * 120)} ${300 + Math.floor(rand() * 400)}`,
    dur: `${(1.4 + rand() * 1.8).toFixed(2)}s`,
    begin: `${(-rand() * 3).toFixed(2)}s`,
    toward: left,
  };
});

const BUILDINGS = (() => {
  const out: { x: number; w: number; h: number }[] = [];
  let x = 0;
  while (x < W) {
    const w = 30 + Math.floor(rand() * 70);
    const nearCenter = Math.abs(x + w / 2 - VP_X) < 260;
    out.push({ x, w, h: (nearCenter ? 20 : 40) + Math.floor(rand() * (nearCenter ? 40 : 110)) });
    x += w + 4;
  }
  return out;
})();

const WINDOWS = BUILDINGS.flatMap((b) =>
  Array.from({ length: Math.floor(b.h / 18) }, () => ({
    x: b.x + 4 + rand() * (b.w - 8),
    y: VP_Y - 4 - rand() * (b.h - 8),
    on: rand() < 0.35,
  })).filter((w) => w.on)
);

const STARS = Array.from({ length: 70 }, () => ({ x: rand() * W, y: rand() * 380, r: 0.5 + rand() * 1.2, o: 0.3 + rand() * 0.6 }));

export default function NightDriveTexture({ className = "", idPrefix = "drive" }: { className?: string; idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050a24" />
            <stop offset="100%" stopColor="#15205a" />
          </linearGradient>
          <linearGradient id={id("road")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1033" />
            <stop offset="100%" stopColor="#05071a" />
          </linearGradient>
          <linearGradient id={id("tri")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff3ea5" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <radialGradient id={id("haze")} cx="50%" cy="48%" r="45%">
            <stop offset="0%" stopColor="#6d5dfc" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6d5dfc" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("vignette")} cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="#05071a" stopOpacity="0" />
            <stop offset="100%" stopColor="#05071a" stopOpacity="0.85" />
          </radialGradient>
          <filter id={id("glow")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={id("blur")} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <rect width={W} height={H} fill={`url(#${id("sky")})`} />
        <g fill="#fff">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} opacity={s.o.toFixed(2)} />
          ))}
        </g>
        <ellipse cx={VP_X} cy={VP_Y - 60} rx="620" ry="300" fill={`url(#${id("haze")})`} />

        {/* Neon triangle, slowly breathing */}
        <polygon
          points={`${VP_X},110 ${VP_X - 330},${VP_Y + 90} ${VP_X + 330},${VP_Y + 90}`}
          fill="#1b2a6b"
          fillOpacity="0.35"
          stroke={`url(#${id("tri")})`}
          strokeWidth="4"
          filter={`url(#${id("glow")})`}
        />

        {/* Skyline on the horizon */}
        <g fill="#070b26">
          {BUILDINGS.map((b, i) => (
            <rect key={i} x={b.x} y={VP_Y - b.h} width={b.w} height={b.h + 2} />
          ))}
        </g>
        <g fill="#fde68a" opacity="0.7">
          {WINDOWS.map((w, i) => (
            <rect key={i} x={w.x.toFixed(1)} y={w.y.toFixed(1)} width="2.5" height="2.5" />
          ))}
        </g>

        {/* Road */}
        <polygon points={`0,${VP_Y} ${W},${VP_Y} ${W},${H} 0,${H}`} fill={`url(#${id("road")})`} />
        <g stroke="#93c5fd" strokeOpacity="0.25" strokeWidth="2">
          <line x1={VP_X - 30} y1={VP_Y} x2={-500} y2={H} />
          <line x1={VP_X + 30} y1={VP_Y} x2={W + 500} y2={H} />
        </g>
        {/* Light trails: static blurred glow + crisp moving dashes */}
        <g filter={`url(#${id("blur")})`} opacity="0.55" fill="none">
          {RAYS.map((r, i) => (
            <path key={i} d={r.d} stroke={r.color} strokeWidth={r.width * 2.6} />
          ))}
        </g>
        <rect width={W} height={H} fill={`url(#${id("vignette")})`} />
      </svg>
      {/* Moving parts live in their own filter-free SVG layer, so each frame
          repaints only thin dashes instead of the whole blurred scene. */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
      >
        <path d={`M${VP_X},${VP_Y + 4} L${VP_X},${H}`} stroke="#e0f2fe" strokeOpacity="0.5" strokeWidth="4" strokeDasharray="14 36">
          <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.9s" repeatCount="indefinite" />
        </path>

        {/* Only every third ray animates -- repainting all 34 each frame was
            measurably heavy; the static glow layer carries the rest. */}
        <g fill="none" strokeLinecap="round">
          {RAYS.filter((_, i) => i % 3 === 0).map((r, i) => (
            <path key={i} d={r.d} stroke={r.color} strokeWidth={r.width} strokeDasharray={r.dash} opacity="0.9">
              <animate
                attributeName="stroke-dashoffset"
                from={r.toward ? "800" : "0"}
                to={r.toward ? "0" : "800"}
                dur={r.dur}
                begin={r.begin}
                repeatCount="indefinite"
              />
            </path>
          ))}
        </g>

      </svg>
    </div>
  );
}
