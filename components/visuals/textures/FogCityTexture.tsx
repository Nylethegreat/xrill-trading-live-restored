// Fog City: a dark teal skyline swallowed by low fog — towers with a few
// warm windows, blinking red aviation beacons, fog banks drifting across,
// and the whole thing reflected in still black water. Original SVG art.

const W = 1600;
const H = 1000;
const WATER = 700;

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
const rand = mulberry32(2718);

// x, width, height, depth (0 far .. 1 near)
const TOWERS = [
  { x: 120, w: 110, h: 360, d: 0.3 },
  { x: 260, w: 150, h: 470, d: 0.55 },
  { x: 450, w: 90, h: 300, d: 0.2 },
  { x: 560, w: 120, h: 420, d: 0.4 },
  { x: 720, w: 170, h: 620, d: 0.95 }, // the tall center tower
  { x: 930, w: 110, h: 480, d: 0.5 },
  { x: 1080, w: 140, h: 560, d: 0.7 },
  { x: 1260, w: 95, h: 330, d: 0.25 },
  { x: 1380, w: 160, h: 440, d: 0.45 },
];

const WINDOWS = TOWERS.flatMap((t, ti) =>
  Array.from({ length: Math.round(3 + t.d * 10) }, () => ({
    t: ti,
    x: t.x + 10 + rand() * (t.w - 24),
    y: WATER - 30 - rand() * (t.h - 60),
    o: 0.25 + rand() * 0.6,
  }))
);

export default function FogCityTexture({ className = "", idPrefix = "fog", still = false }: { className?: string; idPrefix?: string; still?: boolean }) {
  const p = idPrefix;
  const skyline = (
    <>
      {TOWERS.map((t, i) => {
        const shade = Math.round(16 + t.d * 14);
        return (
          <g key={i}>
            <rect x={t.x} y={WATER - t.h} width={t.w} height={t.h} fill={`rgb(${shade - 6},${shade + 6},${shade + 6})`} />
            {/* tops dissolve into the sky — far towers more than near ones */}
            <rect x={t.x} y={WATER - t.h} width={t.w} height={t.h} fill={`url(#${p}-towerfade)`} opacity={1 - t.d * 0.55} />
            {/* subtle vertical facade lines */}
            {Array.from({ length: Math.floor(t.w / 18) }, (_, k) => (
              <line key={k} x1={t.x + 9 + k * 18} y1={WATER - t.h + 6} x2={t.x + 9 + k * 18} y2={WATER} stroke="#9ad1cf" strokeOpacity={0.04 + t.d * 0.05} />
            ))}
            {/* antenna on the tallest */}
            {t.h > 550 && <line x1={t.x + t.w / 2} y1={WATER - t.h} x2={t.x + t.w / 2} y2={WATER - t.h - 70} stroke="#2a3b3c" strokeWidth="4" />}
          </g>
        );
      })}
      {WINDOWS.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width="5" height="7" fill="#fdba74" opacity={w.o * (0.4 + TOWERS[w.t].d * 0.6)} />
      ))}
    </>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1213" />
          <stop offset="60%" stopColor="#1f3132" />
          <stop offset="70%" stopColor="#2b3e3e" />
          <stop offset="100%" stopColor="#050909" />
        </linearGradient>
        <linearGradient id={`${p}-reflect`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-towerfade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f3132" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#2b3e3e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2b3e3e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6f9593" stopOpacity="0" />
          <stop offset="55%" stopColor="#6f9593" stopOpacity="0.32" />
          <stop offset="85%" stopColor="#8fb3b1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8fb3b1" stopOpacity="0" />
        </linearGradient>
        <mask id={`${p}-rmask`}>
          <rect x="0" y={WATER} width={W} height={H - WATER} fill={`url(#${p}-reflect)`} />
        </mask>
        <filter id={`${p}-fogblur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id={`${p}-glow`}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${p}-sky)`} />
      {skyline}
      {/* reflection */}
      <g mask={`url(#${p}-rmask)`}>
        <g transform={`translate(0 ${WATER * 2}) scale(1 -1)`} opacity="0.7">
          {skyline}
        </g>
      </g>
      <rect x="0" y={WATER} width={W} height="2" fill="#5e8584" opacity="0.25" />
      {/* low-lying fog band swallowing the middle of the skyline */}
      <rect x="0" y={WATER - 360} width={W} height="420" fill={`url(#${p}-band)`} />
      {/* drifting fog banks */}
      <g filter={`url(#${p}-fogblur)`} fill="#8fb3b1">
        <g className={still ? undefined : "xr-fog-drift"}>
          <ellipse cx="300" cy="560" rx="520" ry="70" opacity="0.18" />
          <ellipse cx="1200" cy="600" rx="600" ry="80" opacity="0.16" />
          <ellipse cx="2100" cy="570" rx="520" ry="70" opacity="0.18" />
        </g>
        <g className={still ? undefined : "xr-fog-drift-slow"}>
          <ellipse cx="800" cy="380" rx="700" ry="60" opacity="0.1" />
          <ellipse cx="1900" cy="420" rx="600" ry="60" opacity="0.12" />
          <ellipse cx="200" cy="660" rx="500" ry="50" opacity="0.2" />
        </g>
      </g>
      {/* red aviation beacons */}
      {TOWERS.filter((t) => t.d > 0.35).map((t, i) => {
        const cx = t.x + t.w / 2;
        const cy = WATER - t.h - (t.h > 550 ? 70 : 4);
        return (
          <g key={i} className={still ? undefined : "xr-beacon"} style={{ animationDelay: `${i * 0.7}s` }}>
            <circle cx={cx} cy={cy} r="9" fill="#ef4444" filter={`url(#${p}-glow)`} />
            <circle cx={cx} cy={cy} r="3" fill="#fecaca" />
          </g>
        );
      })}
      {/* a few warm street-level glows */}
      {[260, 760, 1120, 1440].map((x, i) => (
        <circle key={i} cx={x} cy={WATER - 6} r="16" fill="#fb923c" opacity="0.45" filter={`url(#${p}-glow)`} />
      ))}
    </svg>
  );
}
