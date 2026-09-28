// Full-bleed decorative background: a deep-violet night sky with a soft
// Milky Way band and a static field of glowing white dots. Pure inline SVG;
// the dots come from a seeded PRNG so server and client render the exact
// same sky every time (no hydration mismatch, no layout shift).

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

const rand = mulberry32(2026);
const DOTS = Array.from({ length: 320 }, () => {
  const big = rand() < 0.05;
  return {
    x: rand() * 1600,
    y: rand() * 1000,
    r: big ? 1.6 + rand() * 1.4 : 0.4 + rand() * 1.1,
    o: big ? 0.9 : 0.25 + rand() * 0.6,
    big,
  };
});

export default function DeepSpaceTexture({
  className = "",
  idPrefix = "space",
}: {
  className?: string;
  idPrefix?: string;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <linearGradient id={id("sky")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0b0a26" />
            <stop offset="55%" stopColor="#1a1450" />
            <stop offset="100%" stopColor="#0a0820" />
          </linearGradient>
          <filter id={id("nebula")} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="38" />
          </filter>
          <filter id={id("glow")} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="1600" height="1000" fill={`url(#${id("sky")})`} />

        {/* Milky Way band: overlapping blurred violet/lavender clouds on a diagonal */}
        <g filter={`url(#${id("nebula")})`} transform="rotate(-18 800 500)">
          <ellipse cx="820" cy="430" rx="520" ry="95" fill="#8b5cf6" opacity="0.35" />
          <ellipse cx="960" cy="410" rx="300" ry="70" fill="#c4b5fd" opacity="0.4" />
          <ellipse cx="620" cy="470" rx="240" ry="60" fill="#a78bfa" opacity="0.3" />
          <ellipse cx="1100" cy="440" rx="180" ry="45" fill="#e9d5ff" opacity="0.35" />
          <ellipse cx="420" cy="520" rx="200" ry="55" fill="#6d28d9" opacity="0.3" />
        </g>

        <g fill="#ffffff">
          {DOTS.filter((d) => !d.big).map((d, i) => (
            <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} opacity={d.o.toFixed(2)} />
          ))}
        </g>
        <g fill="#ffffff" filter={`url(#${id("glow")})`}>
          {DOTS.filter((d) => d.big).map((d, i) => (
            <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} opacity={d.o} />
          ))}
        </g>
      </svg>
    </div>
  );
}
