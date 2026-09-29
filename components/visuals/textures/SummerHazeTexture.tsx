// Full-bleed decorative background: a dreamy, faded summer beach -- a
// violet-to-mint sky, a hazy sun, soft waves rolling in with white foam,
// wet sand, pink light leaks at the corners and a film-photo vignette.
// Original artwork (scenery only), pure inline SVG. The static layer holds
// every blur/glow; only the foam lines move, in their own filter-free SVG.

const W = 1600;
const H = 1000;
const SEA = 470; // horizon

// Foam: thin, broken, slightly irregular lines (two sine waves mixed) so
// it reads as surf, not a squiggle.
const FOAM = [
  { y: 600, amp: 5, dur: "10s", o: 0.35, w: 1.5, dash: "140 60 40 90" },
  { y: 655, amp: 7, dur: "12s", o: 0.45, w: 2, dash: "220 50 90 70" },
  { y: 720, amp: 9, dur: "14s", o: 0.55, w: 2.5, dash: "300 40 120 60" },
];

function wave(y: number, amp: number, seed: number) {
  const pts: string[] = [];
  for (let x = -300; x <= W + 300; x += 20) {
    const dy = Math.sin((x + seed * 97) / 140) * amp + Math.sin((x + seed * 53) / 57) * amp * 0.4;
    pts.push(`${x},${(y + dy).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

export default function SummerHazeTexture({ className = "", idPrefix = "haze" }: { className?: string; idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <linearGradient id={id("sky")} x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%" stopColor="#6d3fc4" />
            <stop offset="45%" stopColor="#b392d8" />
            <stop offset="100%" stopColor="#b9e3b0" />
          </linearGradient>
          <linearGradient id={id("sea")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c6fb5" />
            <stop offset="100%" stopColor="#a58fc9" />
          </linearGradient>
          <linearGradient id={id("sand")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9c2c9" />
            <stop offset="100%" stopColor="#b98fa8" />
          </linearGradient>
          <linearGradient id={id("band")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#f5e9ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={id("sun")} cx="78%" cy="18%" r="35%">
            <stop offset="0%" stopColor="#fff7d1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff7d1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("leakA")} cx="100%" cy="100%" r="60%">
            <stop offset="0%" stopColor="#d6246e" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#d6246e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("leakB")} cx="0%" cy="0%" r="55%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("leakC")} cx="100%" cy="0%" r="45%">
            <stop offset="0%" stopColor="#d9f99d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d9f99d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("vignette")} cx="50%" cy="50%" r="72%">
            <stop offset="50%" stopColor="#1a0b24" stopOpacity="0" />
            <stop offset="100%" stopColor="#1a0b24" stopOpacity="0.75" />
          </radialGradient>
          <filter id={id("soft")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.08" />
            </feComponentTransfer>
          </filter>
        </defs>

        <rect width={W} height={SEA} fill={`url(#${id("sky")})`} />
        <rect width={W} height={H} fill={`url(#${id("sun")})`} />
        <rect y={SEA} width={W} height={260} fill={`url(#${id("sea")})`} />
        {/* haze band softening the horizon */}
        <rect y={SEA - 40} width={W} height="90" fill={`url(#${id("band")})`} />
        {/* sparkle band on the water */}
        <ellipse cx="1240" cy={SEA + 40} rx="260" ry="18" fill="#fff7d1" opacity="0.35" filter={`url(#${id("soft")})`} />
        <path d={`M0,${SEA + 260} Q400,${SEA + 230} 800,${SEA + 250} T1600,${SEA + 240} V${H} H0 Z`} fill={`url(#${id("sand")})`} />
        {/* wet-sand sheen */}
        <path d={`M0,${SEA + 270} Q400,${SEA + 240} 800,${SEA + 262} T1600,${SEA + 252} V${SEA + 330} Q800,${SEA + 310} 0,${SEA + 340} Z`} fill="#ffffff" opacity="0.18" filter={`url(#${id("soft")})`} />

        {/* Light leaks + film look */}
        <rect width={W} height={H} fill={`url(#${id("leakA")})`} />
        <rect width={W} height={H} fill={`url(#${id("leakB")})`} />
        <rect width={W} height={H} fill={`url(#${id("leakC")})`} />
        <rect width={W} height={H} filter={`url(#${id("grain")})`} />
        <rect width={W} height={H} fill={`url(#${id("vignette")})`} />
      </svg>

      {/* Rolling foam lives in its own filter-free layer. */}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" width="100%" height="100%">
        <g fill="none" stroke="#ffffff" strokeLinecap="round">
          {FOAM.map((f, i) => (
            <path key={i} d={wave(f.y, f.amp, i + 1)} strokeWidth={f.w} strokeDasharray={f.dash} opacity={f.o}>
              <animateTransform attributeName="transform" type="translate" values="0,0; -60,5; 0,0" dur={f.dur} repeatCount="indefinite" />
            </path>
          ))}
        </g>
      </svg>
    </div>
  );
}
