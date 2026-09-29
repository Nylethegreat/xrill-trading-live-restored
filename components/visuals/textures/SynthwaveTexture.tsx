// Full-bleed decorative background: synthwave sunset -- a striped neon sun
// sinking behind wireframe mountains and a skyline, over a magenta grid
// floor that scrolls toward you. Original artwork, pure inline SVG. Only
// the grid's horizontal lines animate (plain rects, no filters on them).

const W = 1600;
const H = 1000;
const HZ = 600; // horizon
const VP_X = 800;

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
const rand = mulberry32(1986);

const STARS = Array.from({ length: 90 }, () => ({ x: rand() * W, y: rand() * 380, r: 0.4 + rand() * 1.3, o: 0.3 + rand() * 0.7 }));

// Skyline on both sides, leaving the middle open for the sun.
const BUILDINGS = (() => {
  const out: { x: number; w: number; h: number }[] = [];
  let x = 0;
  while (x < W) {
    const w = 36 + Math.floor(rand() * 60);
    const d = Math.abs(x + w / 2 - VP_X);
    if (d > 300) out.push({ x, w, h: 50 + Math.floor(rand() * (d > 550 ? 230 : 120)) });
    x += w + 6;
  }
  return out;
})();
const WINDOWS = BUILDINGS.flatMap((b) =>
  Array.from({ length: Math.floor(b.h / 14) }, () => ({ x: b.x + 5 + rand() * (b.w - 10), y: HZ - 6 - rand() * (b.h - 12) })).filter(
    () => rand() < 0.45
  )
);

const VERTICALS = Array.from({ length: 25 }, (_, i) => -2400 + i * 266);
const H_LINES = 10;
// Perspective positions for a horizontal grid line at progress t (0..1).
const gridY = (p: number) => HZ + (H - HZ) * p * p;
const H_ANIM = Array.from({ length: H_LINES }, (_, i) => {
  const samples = Array.from({ length: 7 }, (_, s) => gridY((i + s / 6) / H_LINES).toFixed(1));
  return samples.join(";");
});

export default function SynthwaveTexture({ className = "", idPrefix = "synth" }: { className?: string; idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12022b" />
            <stop offset="55%" stopColor="#3d0b5e" />
            <stop offset="100%" stopColor="#b3246f" />
          </linearGradient>
          <linearGradient id={id("sun")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe45c" />
            <stop offset="55%" stopColor="#ff8a3d" />
            <stop offset="100%" stopColor="#ff2d95" />
          </linearGradient>
          <mask id={id("sunMask")}>
            <rect x="0" y="0" width={W} height={H} fill="#fff" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect key={i} x="0" y={455 + i * 24} width={W} height={4 + i * 2.2} fill="#000" />
            ))}
          </mask>
          <linearGradient id={id("floor")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#24063f" />
            <stop offset="100%" stopColor="#07010f" />
          </linearGradient>
          <linearGradient id={id("fade")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#24063f" stopOpacity="1" />
            <stop offset="18%" stopColor="#24063f" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={id("vignette")} cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="#07010f" stopOpacity="0" />
            <stop offset="100%" stopColor="#07010f" stopOpacity="0.8" />
          </radialGradient>
          <filter id={id("glow")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={id("sunGlow")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        <rect width={W} height={HZ} fill={`url(#${id("sky")})`} />
        <g fill="#fff">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} opacity={s.o.toFixed(2)} />
          ))}
        </g>

        {/* Sun */}
        <circle cx={VP_X} cy="470" r="230" fill="#ff5fa2" opacity="0.5" filter={`url(#${id("sunGlow")})`} />
        <circle cx={VP_X} cy="470" r="210" fill={`url(#${id("sun")})`} mask={`url(#${id("sunMask")})`} />

        {/* Wireframe mountains */}
        <g stroke="#ff3ea5" strokeWidth="1.5" strokeOpacity="0.7" fill="#1a0433" filter={`url(#${id("glow")})`}>
          <polygon points={`120,${HZ} 330,440 470,520 590,410 720,${HZ}`} />
          <polygon points={`880,${HZ} 1010,420 1150,510 1280,430 1480,${HZ}`} />
        </g>
        <g stroke="#ff3ea5" strokeOpacity="0.35" strokeWidth="1">
          <line x1="330" y1="440" x2="420" y2={HZ} />
          <line x1="590" y1="410" x2="520" y2={HZ} />
          <line x1="1010" y1="420" x2="1080" y2={HZ} />
          <line x1="1280" y1="430" x2="1200" y2={HZ} />
        </g>

        {/* Skyline */}
        <g fill="#0d0120">
          {BUILDINGS.map((b, i) => (
            <rect key={i} x={b.x} y={HZ - b.h} width={b.w} height={b.h} />
          ))}
        </g>
        <g fill="#67e8f9" opacity="0.75">
          {WINDOWS.map((w, i) => (
            <rect key={i} x={w.x.toFixed(1)} y={w.y.toFixed(1)} width="3" height="3" />
          ))}
        </g>

        {/* Grid floor */}
        <rect x="0" y={HZ} width={W} height={H - HZ} fill={`url(#${id("floor")})`} />
        <g stroke="#ff3ea5" strokeWidth="2" strokeOpacity="0.75" filter={`url(#${id("glow")})`}>
          {VERTICALS.map((x, i) => (
            <line key={i} x1={VP_X + (x - VP_X) * 0.06} y1={HZ} x2={x} y2={H} />
          ))}
          <line x1="0" y1={HZ} x2={W} y2={HZ} strokeWidth="3" />
        </g>
        <rect x="0" y={HZ} width={W} height={H - HZ} fill={`url(#${id("fade")})`} />

        <rect width={W} height={H} fill={`url(#${id("vignette")})`} />
      </svg>
      {/* The scrolling grid lines get their own filter-free layer so each
          frame repaints only thin rects, not the glowing sun/mountains. */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
      >
        <g>
        <g fill="#ff3ea5" opacity="0.8">
            {H_ANIM.map((values, i) => (
              <rect key={i} x="0" y={gridY(i / H_LINES)} width={W} height="2">
                <animate attributeName="y" values={values} dur="2.4s" repeatCount="indefinite" />
              </rect>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
