// Full-bleed decorative background: a cozy 90s bedroom desk at night --
// warm desk lamp, a CRT TV glowing blue with an XRILL candlestick chart on
// screen, a VCR blinking 12:00, a boombox, cassette tapes, a gamepad, a
// lava lamp, abstract neon posters and a window full of city lights.
// Original artwork (no real brands, games or film posters), pure inline
// SVG; only a few small pieces animate (lava blobs, VCR clock, screen
// flicker, window lights).

const W = 1600;
const H = 1000;
const DESK = 770;

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
const rand = mulberry32(1994);

// City lights in the window
const CITY_LIGHTS = Array.from({ length: 70 }, () => ({
  x: 80 + rand() * 330,
  y: 330 + rand() * 170,
  r: 1 + rand() * 2.4,
  color: ["#fde68a", "#fb923c", "#f472b6", "#93c5fd"][Math.floor(rand() * 4)],
  twinkle: rand() < 0.25,
  dur: `${(2 + rand() * 4).toFixed(1)}s`,
}));
const CITY_BLOCKS = Array.from({ length: 12 }, (_, i) => ({ x: 70 + i * 29, h: 50 + rand() * 130 }));

// Candles on the TV screen
const CANDLES = [
  { o: 60, c: 44, h: 38, l: 66 },
  { o: 44, c: 50, h: 40, l: 56 },
  { o: 50, c: 34, h: 30, l: 54 },
  { o: 34, c: 40, h: 28, l: 46 },
  { o: 40, c: 24, h: 20, l: 44 },
  { o: 24, c: 30, h: 18, l: 34 },
  { o: 30, c: 14, h: 10, l: 34 },
];

export default function RetroRoomTexture({ className = "", idPrefix = "room" }: { className?: string; idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <linearGradient id={id("wall")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a1509" />
            <stop offset="45%" stopColor="#4a260f" />
            <stop offset="100%" stopColor="#3a0f2c" />
          </linearGradient>
          <radialGradient id={id("lampGlow")} cx="38%" cy="55%" r="45%">
            <stop offset="0%" stopColor="#ffb347" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("pinkGlow")} cx="92%" cy="60%" r="40%">
            <stop offset="0%" stopColor="#ff3ea5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff3ea5" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id("desk")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a4518" />
            <stop offset="100%" stopColor="#2b1406" />
          </linearGradient>
          <linearGradient id={id("night")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1440" />
            <stop offset="100%" stopColor="#1d1b5e" />
          </linearGradient>
          <radialGradient id={id("screen")} cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#2f6bff" />
            <stop offset="100%" stopColor="#0b1f7a" />
          </radialGradient>
          <linearGradient id={id("silver")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b9b2a8" />
            <stop offset="100%" stopColor="#5e574f" />
          </linearGradient>
          <linearGradient id={id("lava")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff7ac8" />
            <stop offset="100%" stopColor="#c0167a" />
          </linearGradient>
          <linearGradient id={id("cone")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff1c1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fff1c1" stopOpacity="0" />
          </linearGradient>
          <pattern id={id("scan")} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="2" fill="#000" opacity="0.18" />
          </pattern>
          <radialGradient id={id("vignette")} cx="50%" cy="50%" r="75%">
            <stop offset="50%" stopColor="#0a0503" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a0503" stopOpacity="0.85" />
          </radialGradient>
          <filter id={id("glow")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Wall + lighting */}
        <rect width={W} height={DESK} fill={`url(#${id("wall")})`} />
        <rect width={W} height={DESK} fill={`url(#${id("lampGlow")})`} />
        <rect width={W} height={DESK} fill={`url(#${id("pinkGlow")})`} />

        {/* Window with blinds and city lights */}
        <rect x="60" y="80" width="370" height="440" fill={`url(#${id("night")})`} stroke="#1a0d05" strokeWidth="14" />
        <g fill="#0a0f2e">
          {CITY_BLOCKS.map((b, i) => (
            <rect key={i} x={b.x} y={512 - b.h} width="26" height={b.h} />
          ))}
        </g>
        {CITY_LIGHTS.map((l, i) => (
          <circle key={i} cx={l.x.toFixed(1)} cy={l.y.toFixed(1)} r={l.r.toFixed(2)} fill={l.color} filter={`url(#${id("soft")})`}>
            {l.twinkle && <animate attributeName="opacity" values="1;0.3;1" dur={l.dur} repeatCount="indefinite" />}
          </circle>
        ))}
        <g fill="#8a6a3c" opacity="0.85">
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x="67" y={88 + i * 22} width="356" height="12" rx="2" />
          ))}
        </g>
        <rect x="67" y="286" width="356" height="6" fill="#5a3f1d" />

        {/* Abstract posters (original designs, no text) */}
        <g>
          {/* sunset + palm */}
          <rect x="560" y="120" width="210" height="300" fill="#2b0f3a" stroke="#120616" strokeWidth="6" />
          <circle cx="665" cy="300" r="62" fill="#ff8a3d" />
          <rect x="566" y="300" width="198" height="114" fill="#1a0726" />
          <path d="M700,414 C705,360 700,320 712,280" stroke="#0c0410" strokeWidth="6" fill="none" />
          <path d="M712,280 q-40,-8 -58,14 M712,280 q30,-20 58,-4 M712,280 q-10,-30 -40,-40 M712,280 q24,-30 50,-22" stroke="#0c0410" strokeWidth="5" fill="none" />
          {/* neon grid mountains */}
          <rect x="880" y="100" width="210" height="300" fill="#0c0626" stroke="#120616" strokeWidth="6" />
          <polygon points="890,330 950,240 1000,300 1040,220 1080,330" fill="none" stroke="#22d3ee" strokeWidth="3" filter={`url(#${id("soft")})`} />
          <polygon points="890,330 950,240 1000,300 1040,220 1080,330" fill="none" stroke="#a5f3fc" strokeWidth="1.5" />
          {[340, 356, 376].map((y) => (
            <line key={y} x1="886" y1={y} x2="1084" y2={y} stroke="#e879f9" strokeWidth="2" />
          ))}
          {/* neon triangle */}
          <rect x="1180" y="120" width="210" height="300" fill="#140a2e" stroke="#120616" strokeWidth="6" />
          <polygon points="1285,170 1225,340 1345,340" fill="none" stroke="#ff3ea5" strokeWidth="4" filter={`url(#${id("glow")})`} />
        </g>

        {/* Desk */}
        <rect x="0" y={DESK} width={W} height={H - DESK} fill={`url(#${id("desk")})`} />
        <rect x="0" y={DESK} width={W} height="6" fill="#a8652a" opacity="0.6" />

        {/* Lamp light cone */}
        <polygon points="560,400 640,400 820,780 380,780" fill={`url(#${id("cone")})`} />

        {/* Boombox */}
        <g transform="translate(-150,0)">
          <rect x="250" y="600" width="400" height="175" rx="14" fill={`url(#${id("silver")})`} />
          <path d="M300,600 V560 H600 V600" fill="none" stroke="#6b645b" strokeWidth="10" />
          {[340, 560].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="695" r="58" fill="#1c1a18" />
              <circle cx={cx} cy="695" r="44" fill="#2e2b28" />
              <circle cx={cx} cy="695" r="14" fill="#141210" />
            </g>
          ))}
          <rect x="405" y="640" width="90" height="60" rx="4" fill="#26231f" />
          <rect x="415" y="652" width="70" height="30" rx="3" fill="#48413a" />
          <rect x="270" y="614" width="360" height="12" rx="3" fill="#7a736a" />
        </g>

        {/* Desk lamp */}
        <g>
          <ellipse cx="540" cy="770" rx="70" ry="12" fill="#151515" />
          <path d="M540,765 C530,640 560,520 610,430" stroke="#1d1d1d" strokeWidth="10" fill="none" />
          <path d="M560,420 C570,370 640,350 680,390 L650,440 C620,420 590,420 560,420 Z" fill="#1d1d1d" />
          <ellipse cx="612" cy="425" rx="40" ry="12" fill="#fff4cf" filter={`url(#${id("glow")})`} />
        </g>

        {/* CRT TV + VCR */}
        <g>
          <rect x="850" y="470" width="400" height="44" rx="4" fill="#1a1a1a" />
          <rect x="870" y="484" width="220" height="6" fill="#2d2d2d" />
          <text x="1190" y="500" fontFamily="ui-monospace, monospace" fontSize="18" fontWeight="700" fill="#4ade80" textAnchor="end">
            12:00
            <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.6s" repeatCount="indefinite" />
          </text>
          <rect x="830" y="514" width="440" height="270" rx="22" fill="#2a2522" />
          <rect x="870" y="542" width="360" height="210" rx="26" fill={`url(#${id("screen")})`} filter={`url(#${id("soft")})`} opacity="0.7" />
          <rect x="870" y="542" width="360" height="210" rx="26" fill={`url(#${id("screen")})`}>
            <animate attributeName="opacity" values="1;0.94;1;0.97;1" dur="3.2s" repeatCount="indefinite" />
          </rect>
          <text x="1050" y="596" fontFamily="ui-monospace, monospace" fontSize="30" fontWeight="800" letterSpacing="6" fill="#ffffff" textAnchor="middle">
            XRILL
          </text>
          <g>
            {CANDLES.map((c, i) => {
              // map candle values (10-66) onto the screen's chart area (y 612-730)
              const y = (v: number) => 612 + (v - 10) * 2.1;
              const up = c.c < c.o;
              const x = 928 + i * 36;
              const color = up ? "#4ade80" : "#f87171";
              return (
                <g key={i}>
                  <line x1={x + 8} y1={y(c.h)} x2={x + 8} y2={y(c.l)} stroke={color} strokeWidth="2.5" />
                  <rect x={x} y={y(Math.min(c.o, c.c))} width="16" height={Math.max(5, Math.abs(c.o - c.c) * 2.1)} fill={color} />
                </g>
              );
            })}
          </g>
          <rect x="870" y="542" width="360" height="210" rx="26" fill={`url(#${id("scan")})`} />
          <rect x="1000" y="758" width="100" height="10" rx="3" fill="#1b1816" />
        </g>

        {/* Lava lamp */}
        <g>
          <polygon points="1420,770 1520,770 1500,720 1440,720" fill="#26211d" />
          <path d="M1446,722 L1432,600 C1440,540 1500,540 1508,600 L1494,722 Z" fill={`url(#${id("lava")})`} opacity="0.55" />
          <g fill="#ff4fb0" filter={`url(#${id("soft")})`}>
            <circle cx="1466" cy="690" r="18">
              <animate attributeName="cy" values="700;600;700" dur="9s" repeatCount="indefinite" />
            </circle>
            <circle cx="1480" cy="640" r="13">
              <animate attributeName="cy" values="620;700;620" dur="11s" repeatCount="indefinite" />
            </circle>
            <circle cx="1470" cy="600" r="10">
              <animate attributeName="cy" values="590;660;590" dur="7s" repeatCount="indefinite" />
            </circle>
          </g>
          <path d="M1446,590 C1452,560 1488,560 1494,590" fill="#26211d" />
          <ellipse cx="1470" cy="650" rx="90" ry="120" fill="#ff3ea5" opacity="0.18" filter={`url(#${id("glow")})`} />
        </g>

        {/* Cassettes (generic labels) */}
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(80,${850 - i * 34}) rotate(${i === 1 ? -3 : 2})`}>
              <rect width="210" height="32" rx="3" fill={["#1f1f1f", "#2b2b2b", "#191919"][i]} />
              <rect x="10" y="6" width="120" height="20" rx="2" fill={["#e5e0d4", "#ff6b3d", "#d9d4c7"][i]} />
              <rect x="150" y="10" width="46" height="12" rx="2" fill="#555" />
            </g>
          ))}
        </g>

        {/* Gamepad (generic) */}
        <g transform="translate(700,880)">
          <path d="M0,20 C0,-4 40,-6 60,4 H120 C140,-6 180,-4 180,20 C180,50 160,62 140,48 L120,36 H60 L40,48 C20,62 0,50 0,20 Z" fill="#141414" />
          <rect x="30" y="16" width="30" height="8" rx="2" fill="#333" />
          <rect x="41" y="5" width="8" height="30" rx="2" fill="#333" />
          <circle cx="130" cy="14" r="6" fill="#333" />
          <circle cx="148" cy="24" r="6" fill="#333" />
        </g>

        {/* Game boxes (generic colored spines) */}
        <g>
          {["#b91c1c", "#1d4ed8", "#a16207", "#6d28d9"].map((c, i) => (
            <rect key={c} x="1290" y={900 - i * 38} width="260" height="34" rx="2" fill={c} opacity="0.85" />
          ))}
        </g>

        <rect width={W} height={H} fill={`url(#${id("vignette")})`} />
      </svg>
    </div>
  );
}
