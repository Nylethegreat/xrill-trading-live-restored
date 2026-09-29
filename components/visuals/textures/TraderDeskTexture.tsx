// Full-bleed decorative background: a minimalist trader's desk at night --
// a dim charcoal wall with a world map and four session clocks (New York,
// London, Tokyo, Sydney), two monitors glowing with live-looking charts, a
// slim desk lamp, a glass of water and a notebook on a dark wood desk.
// Original artwork, pure inline SVG. Only the monitors' "live" price lines
// and the clock colons animate, each in a small, filter-free way.

const W = 1600;
const H = 1000;
const DESK = 700;

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

// A simple random-walk price series, returned as an SVG polyline string
// fitted into a box.
function series(n: number, x0: number, y0: number, w: number, h: number, drift: number) {
  const pts: number[] = [];
  let v = 0.5;
  for (let i = 0; i < n; i++) {
    v += (rand() - 0.5 + drift) * 0.12;
    v = Math.min(0.95, Math.max(0.05, v));
    pts.push(v);
  }
  return pts.map((p, i) => `${(x0 + (i / (n - 1)) * w).toFixed(1)},${(y0 + (1 - p) * h).toFixed(1)}`).join(" ");
}

function candles(n: number, x0: number, y0: number, w: number, h: number) {
  const out: { x: number; o: number; c: number; hi: number; lo: number }[] = [];
  let v = 0.5;
  for (let i = 0; i < n; i++) {
    const o = v;
    v = Math.min(0.9, Math.max(0.1, v + (rand() - 0.47) * 0.1));
    const c = v;
    out.push({ x: x0 + (i / n) * w, o: y0 + (1 - o) * h, c: y0 + (1 - c) * h, hi: y0 + (1 - Math.max(o, c) - rand() * 0.05) * h, lo: y0 + (1 - Math.min(o, c) + rand() * 0.05) * h });
  }
  return out;
}

const LEFT = { x: 330, y: 330, w: 440, h: 270 };
const RIGHT = { x: 830, y: 330, w: 440, h: 270 };
const L_CANDLES = candles(34, LEFT.x + 20, LEFT.y + 40, LEFT.w - 150, 150);
const L_MA = series(34, LEFT.x + 20, LEFT.y + 50, LEFT.w - 150, 140, 0.02);
const R_LINE_A = series(60, RIGHT.x + 20, RIGHT.y + 40, 250, 110, 0.03);
const R_LINE_B = series(60, RIGHT.x + 20, RIGHT.y + 150, 250, 80, -0.01);
const R_BARS = Array.from({ length: 26 }, (_, i) => ({ x: RIGHT.x + 20 + i * 9.6, h: 8 + rand() * 30, up: rand() > 0.45 }));
const BOOK_ROWS = Array.from({ length: 14 }, (_, i) => ({ y: i * 14, bid: rand() > 0.5, w: 20 + rand() * 60 }));

// Simplified world landmasses (stylized blobs, not a traced map).
const LAND = [
  "M420,120 C460,95 540,90 590,110 C610,140 580,170 560,195 C540,215 520,240 500,250 C480,235 470,210 450,195 C430,180 400,160 420,120 Z", // N. America
  "M520,262 C545,258 565,280 560,310 C552,345 540,375 525,395 C512,380 506,345 505,315 C503,290 505,268 520,262 Z", // S. America
  "M720,110 C760,100 800,110 820,125 C810,150 790,160 770,170 C750,168 735,150 720,140 Z", // Europe
  "M740,185 C780,178 820,195 825,230 C822,270 800,305 780,320 C762,300 750,265 742,240 C735,215 730,195 740,185 Z", // Africa
  "M830,105 C900,90 1000,100 1060,125 C1080,150 1060,180 1020,195 C980,205 940,200 900,190 C870,180 845,160 830,140 Z", // Asia
  "M1010,300 C1040,292 1075,300 1085,320 C1075,340 1045,345 1020,338 C1005,330 1000,312 1010,300 Z", // Australia
];

const CLOCKS = [
  { x: 470, y: 150, label: "NEW YORK", time: "09:30" },
  { x: 770, y: 150, label: "LONDON", time: "14:30" },
  { x: 1030, y: 150, label: "TOKYO", time: "22:30" },
  { x: 1060, y: 330, label: "SYDNEY", time: "00:30" },
];

export default function TraderDeskTexture({ className = "", idPrefix = "desk" }: { className?: string; idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15171c" />
            <stop offset="100%" stopColor="#23262d" />
          </linearGradient>
          <radialGradient id={id("screenSpill")} cx="50%" cy="60%" r="45%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("lampSpill")} cx="84%" cy="62%" r="30%">
            <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id("desk")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a2c17" />
            <stop offset="100%" stopColor="#1a0f08" />
          </linearGradient>
          <linearGradient id={id("screen")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1224" />
            <stop offset="100%" stopColor="#0a0f1d" />
          </linearGradient>
          <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id={id("water")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id={id("reflect")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={id("vignette")} cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="#0b0c10" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b0c10" stopOpacity="0.85" />
          </radialGradient>
          <filter id={id("soft")} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Wall, lighting */}
        <rect width={W} height={DESK} fill={`url(#${id("wall")})`} />
        <rect width={W} height={DESK} fill={`url(#${id("screenSpill")})`} />
        <rect width={W} height={DESK} fill={`url(#${id("lampSpill")})`} />

        {/* World map with session clocks -- scaled up and back so nothing
            hides behind the monitors */}
        <g transform="translate(243,14) scale(0.75)">
        <g fill="#8b93a3" opacity="0.55">
          {LAND.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g stroke="#c7cedb" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5" fill="none">
          <path d="M500,175 Q630,70 760,125" />
          <path d="M790,130 Q920,90 1040,165" />
          <path d="M1050,185 Q1090,260 1060,315" />
        </g>
        {CLOCKS.map((c) => (
          <g key={c.label} transform={`translate(${c.x},${c.y})`}>
            <rect x="-38" y="-16" width="76" height="30" rx="3" fill="#0d0f14" stroke="#3a3f4a" />
            <text x="0" y="5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fontWeight="700" fill="#e5e7eb">
              {c.time.slice(0, 2)}
              <tspan>
                :
                <animate attributeName="opacity" values="1;1;0.2;0.2" keyTimes="0;0.5;0.5;1" dur="2s" repeatCount="indefinite" />
              </tspan>
              {c.time.slice(3)}
            </text>
            <text x="0" y="-22" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="8" letterSpacing="2" fill="#9ca3af">
              {c.label}
            </text>
          </g>
        ))}

        </g>

        {/* Shelf plant, far right */}
        <g transform="translate(1440,420)">
          <rect x="-26" y="30" width="52" height="40" rx="4" fill="#d6d3cd" />
          {[-30, -12, 8, 26].map((dx, i) => (
            <path key={i} d={`M0,32 Q${dx * 0.6},${-10 - i * 4} ${dx},-40`} stroke="#4d7c52" strokeWidth="6" fill="none" strokeLinecap="round" />
          ))}
        </g>

        {/* Desk */}
        <rect x="0" y={DESK} width={W} height={H - DESK} fill={`url(#${id("desk")})`} />
        <rect x="0" y={DESK} width={W} height="4" fill="#6b4226" opacity="0.7" />

        {/* Monitors: stands, bezels, glow */}
        {[LEFT, RIGHT].map((m, i) => (
          <g key={i}>
            <rect x={m.x + m.w / 2 - 10} y={m.y + m.h} width="20" height={DESK - m.y - m.h - 6} fill="#1c1e23" />
            <rect x={m.x + m.w / 2 - 70} y={DESK - 10} width="140" height="10" rx="3" fill="#1c1e23" />
            <rect x={m.x - 14} y={m.y - 14} width={m.w + 28} height={m.h + 28} rx="10" fill="#3b82f6" opacity="0.25" filter={`url(#${id("soft")})`} />
            <rect x={m.x - 8} y={m.y - 8} width={m.w + 16} height={m.h + 16} rx="6" fill="#0e0f12" />
            <rect x={m.x} y={m.y} width={m.w} height={m.h} fill={`url(#${id("screen")})`} />
            {/* screen grid */}
            <g stroke="#1f2a44" strokeWidth="1">
              {[1, 2, 3, 4].map((k) => (
                <line key={k} x1={m.x} y1={m.y + (k * m.h) / 5} x2={m.x + m.w} y2={m.y + (k * m.h) / 5} />
              ))}
            </g>
            {/* reflection on the desk */}
            <rect x={m.x} y={DESK + 6} width={m.w} height="110" fill={`url(#${id("reflect")})`} />
          </g>
        ))}

        {/* Left monitor: candlesticks + moving average + order book */}
        <g>
          {L_CANDLES.map((c, i) => {
            const up = c.c < c.o;
            const color = up ? "#22c55e" : "#ef4444";
            return (
              <g key={i}>
                <line x1={c.x + 3} y1={c.hi} x2={c.x + 3} y2={c.lo} stroke={color} strokeWidth="1" />
                <rect x={c.x} y={Math.min(c.o, c.c)} width="6" height={Math.max(2, Math.abs(c.o - c.c))} fill={color} />
              </g>
            );
          })}
          <polyline points={L_MA} fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.85" />
          <g transform={`translate(${LEFT.x + LEFT.w - 110},${LEFT.y + 30})`}>
            {BOOK_ROWS.map((r, i) => (
              <rect key={i} x={0} y={r.y} width={r.w} height="9" fill={r.bid ? "#22c55e" : "#ef4444"} opacity="0.35" />
            ))}
          </g>
          <text x={LEFT.x + 20} y={LEFT.y + 24} fontFamily="ui-monospace, monospace" fontSize="12" fill="#94a3b8">
            SPY · 5m
          </text>
        </g>

        {/* Right monitor: two line charts + volume bars */}
        <g>
          <polyline points={R_LINE_A} fill="none" stroke="#38bdf8" strokeWidth="2" />
          <polyline points={R_LINE_B} fill="none" stroke="#f472b6" strokeWidth="1.5" opacity="0.85" />
          {R_BARS.map((b, i) => (
            <rect key={i} x={b.x} y={RIGHT.y + RIGHT.h - 20 - b.h} width="6" height={b.h} fill={b.up ? "#22c55e" : "#ef4444"} opacity="0.6" />
          ))}
          <g transform={`translate(${RIGHT.x + 300},${RIGHT.y + 30})`} fontFamily="ui-monospace, monospace" fontSize="11">
            {["QQQ", "NVDA", "AAPL", "TSLA", "MSFT", "AMD", "META"].map((t, i) => (
              <g key={t} transform={`translate(0,${i * 26})`}>
                <text x="0" y="0" fill="#cbd5e1">
                  {t}
                </text>
                <text x="120" y="0" textAnchor="end" fill={i % 3 === 1 ? "#ef4444" : "#22c55e"}>
                  {i % 3 === 1 ? "-0.8%" : "+1.2%"}
                </text>
              </g>
            ))}
          </g>
          <text x={RIGHT.x + 20} y={RIGHT.y + 24} fontFamily="ui-monospace, monospace" fontSize="12" fill="#94a3b8">
            WATCHLIST
          </text>
        </g>

        {/* Slim desk lamp */}
        <g>
          <ellipse cx="1380" cy={DESK - 2} rx="40" ry="7" fill="#15161a" />
          <rect x="1376" y="470" width="8" height={DESK - 470} fill="#1c1d21" />
          <rect x="1340" y="455" width="80" height="16" rx="4" fill="#1c1d21" />
          <rect x="1344" y="470" width="72" height="4" fill="#ffe7bd" opacity="0.9" />
          <polygon points="1344,474 1416,474 1470,700 1290,700" fill="#ffe7bd" opacity="0.08" />
        </g>

        {/* Glass of water */}
        <g transform="translate(250,560)">
          <path d="M0,0 L10,138 Q40,146 70,138 L80,0 Z" fill={`url(#${id("glass")})`} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
          <path d="M4,40 L10,138 Q40,146 70,138 L76,40 Q40,48 4,40 Z" fill={`url(#${id("water")})`} />
          <ellipse cx="40" cy="40" rx="36" ry="5" fill="#bfdbfe" opacity="0.35" />
          <ellipse cx="40" cy="0" rx="40" ry="5" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.5" />
          <rect x="14" y="10" width="5" height="110" rx="2" fill="#ffffff" opacity="0.18" />
        </g>

        {/* Notebook + pen */}
        <g transform="translate(560,790) rotate(-6)">
          <rect x="0" y="0" width="230" height="130" rx="6" fill="#16171b" />
          <rect x="8" y="6" width="214" height="118" rx="4" fill="#1e2026" />
          <rect x="190" y="0" width="10" height="130" fill="#3b3f48" />
          <rect x="250" y="40" width="150" height="8" rx="4" fill="#c9a96e" transform="rotate(12 250 40)" />
        </g>

        {/* Keyboard + mouse */}
        <g>
          <rect x="690" y="740" width="360" height="70" rx="8" fill="#1a1b1f" />
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 16 }, (_, k) => (
              <rect key={`${r}-${k}`} x={700 + k * 21.5} y={750 + r * 14} width="18" height="10" rx="2" fill="#2a2c32" />
            ))
          )}
          <ellipse cx="1120" cy="780" rx="24" ry="34" fill="#d4d4d8" opacity="0.85" />
        </g>

        <rect width={W} height={H} fill={`url(#${id("vignette")})`} />
      </svg>
    </div>
  );
}
