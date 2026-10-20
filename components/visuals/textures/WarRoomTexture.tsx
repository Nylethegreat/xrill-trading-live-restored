// War Room: an underground Cold-War command bunker, zombies-map style —
// a domed ceiling wrapped in a glowing cyan grid with a dark globe behind
// it, a heavy monolith hanging from the center, red alarm beacons, a
// mezzanine with railings and green-lit consoles, "ALERT 1" placards, a
// big world-map screen, and an orange glowing floor grid. Original SVG
// (no real insignia). Beacons pulse and the map blips via .xr-* classes,
// still under reduced motion.
const W = 1600, H = 1000;

// very rough continents on a 0..100 x 0..50 grid (equirectangular-ish)
const LAND = [
  "M8 10 L22 7 L30 10 L28 18 L22 22 L18 28 L12 22 L6 16Z", // N America
  "M22 28 L28 30 L30 38 L26 47 L23 44 L21 34Z", // S America
  "M44 9 L54 7 L56 12 L50 15 L45 14Z", // Europe
  "M45 18 L56 17 L60 24 L57 36 L52 40 L48 30 L44 24Z", // Africa
  "M56 7 L80 6 L92 12 L88 20 L78 22 L72 28 L64 22 L58 15Z", // Asia
  "M80 34 L90 33 L92 40 L84 42 L79 39Z", // Australia
  "M33 3 L40 2 L41 7 L35 8Z", // Greenland
];
const BLIPS = [
  { x: 18, y: 16 }, { x: 50, y: 11 }, { x: 74, y: 15 }, { x: 54, y: 26 }, { x: 26, y: 36 }, { x: 86, y: 37 },
];

function Console({ x, y, w, glow = "#6ee7b7" }: { x: number; y: number; w: number; glow?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="46" fill="#1b2420" />
      <rect x={x + 6} y={y + 6} width={w - 12} height="20" fill={glow} opacity="0.55" />
      <rect x={x + 6} y={y + 6} width={w - 12} height="20" fill={glow} opacity="0.25" className="xr-war-flicker" />
      {Array.from({ length: Math.floor((w - 12) / 10) }, (_, i) => (
        <circle key={i} cx={x + 11 + i * 10} cy={y + 36} r="2" fill={i % 3 === 0 ? "#f87171" : "#fde68a"} opacity="0.8" />
      ))}
    </g>
  );
}

function Placard({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="64" height="20" rx="2" fill="#0d1526" stroke="#93c5fd" strokeOpacity="0.6" />
      <text x={x + 8} y={y + 14} fontSize="11" fontFamily="monospace" fill="#dbeafe" letterSpacing="1">ALERT</text>
      <rect x={x + 50} y={y + 3} width="11" height="14" fill="#e5e7eb" />
      <text x={x + 52.5} y={y + 14.5} fontSize="11" fontFamily="monospace" fill="#0d1526" fontWeight="bold">1</text>
    </g>
  );
}

export default function WarRoomTexture({ className = "", idPrefix = "war" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  const mapX = 600, mapY = 690, mapW = 400, mapH = 200;
  const sx = mapW / 100, sy = mapH / 50;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-room`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0%" stopColor="#1a2230" />
          <stop offset="60%" stopColor="#0b0f17" />
          <stop offset="100%" stopColor="#040509" />
        </radialGradient>
        <radialGradient id={`${p}-red`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-floor`} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#ff8a1f" />
          <stop offset="70%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#3b1205" />
        </radialGradient>
        <linearGradient id={`${p}-screen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5d8ff" />
          <stop offset="100%" stopColor="#5b9bd5" />
        </linearGradient>
        <radialGradient id={`${p}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${p}-dome`}>
          <path d="M120 0 L1480 0 L1480 120 Q800 240 120 120Z" />
        </clipPath>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-room)`} />

      {/* dome with a dark globe and a cyan lat/long grid */}
      <g clipPath={`url(#${p}-dome)`}>
        <rect x="120" y="0" width="1360" height="240" fill="#0a1424" />
        <path d="M300 60 Q420 20 520 70 Q600 110 700 60 L760 120 Q620 170 480 140Z" fill="#05080e" />
        <path d="M900 30 Q1040 10 1180 60 Q1260 100 1200 140 Q1060 150 980 110Z" fill="#05080e" />
        <circle cx="560" cy="90" r="5" fill="#ef4444" opacity="0.7" />
        <circle cx="1050" cy="70" r="4" fill="#ef4444" opacity="0.6" />
        <g stroke="#67e8f9" strokeWidth="5" fill="none" opacity="0.85">
          {[-520, -300, -110, 110, 300, 520].map((dx, i) => (
            <path key={i} d={`M${800 + dx * 0.25} -20 Q${800 + dx} 140 ${800 + dx * 1.6} 300`} />
          ))}
          {[40, 95, 150].map((y, i) => (
            <path key={`l${i}`} d={`M100 ${y - 30} Q800 ${y + 70 + i * 20} 1500 ${y - 30}`} />
          ))}
        </g>
        <g stroke="#a5f3fc" strokeWidth="1.5" fill="none" opacity="0.9">
          {[-520, -300, -110, 110, 300, 520].map((dx, i) => (
            <path key={i} d={`M${800 + dx * 0.25} -20 Q${800 + dx} 140 ${800 + dx * 1.6} 300`} />
          ))}
        </g>
      </g>
      <path d="M120 120 Q800 240 1480 120 L1480 140 Q800 262 120 140Z" fill="#141a24" />

      {/* back wall + ceiling strip lights */}
      <rect x="0" y="200" width={W} height="160" fill="#111723" />
      {[60, 180, 420, 540, 760, 1000, 1240, 1380].map((x, i) => (
        <rect key={i} x={x} y={i < 2 || i > 5 ? 222 : 258} width="110" height="7" rx="3" fill="#f1f5f9" opacity="0.85" />
      ))}

      {/* hanging monolith */}
      <rect x="780" y="0" width="40" height="60" fill="#0e1118" />
      <path d="M690 40 L910 40 L900 270 L700 270Z" fill="#1c212b" />
      <path d="M690 40 L910 40 L905 60 L695 60Z" fill="#2a303c" />
      <circle cx="800" cy="150" r="22" fill="#0b0d12" stroke="#3b4252" strokeWidth="3" />
      <circle cx="800" cy="150" r="6" fill="#ef4444" opacity="0.6" className="xr-war-flicker" />
      <rect x="745" y="70" width="110" height="10" fill="#3b4252" opacity="0.6" />
      <rect x="760" y="215" width="80" height="6" fill="#3b4252" opacity="0.6" />

      {/* emblem on the left wall (original star seal) */}
      <g transform="translate(110 300)">
        <ellipse rx="54" ry="36" fill="#0f2a3d" stroke="#5eead4" strokeOpacity="0.5" strokeWidth="3" />
        <path d="M0 -20 L6 -6 L21 -6 L9 3 L13 18 L0 9 L-13 18 L-9 3 L-21 -6 L-6 -6Z" fill="#d1fae5" opacity="0.75" />
      </g>

      {/* mezzanine floor + door */}
      <rect x="0" y="360" width={W} height="20" fill="#1e2532" />
      <rect x="0" y="380" width={W} height="180" fill="#0d121b" />
      <rect x="745" y="300" width="110" height="62" fill="#e8f1ff" opacity="0.85" />
      <rect x="745" y="300" width="110" height="62" fill={`url(#${p}-lamp)`} />
      <Console x={300} y={312} w={130} />
      <Console x={470} y={312} w={110} />
      <Console x={1030} y={312} w={130} />
      <Console x={1200} y={312} w={160} glow="#86efac" />
      <Console x={1400} y={312} w={150} glow="#a7f3d0" />
      {/* railing */}
      <g stroke="#3a4253" strokeWidth="4">
        <line x1="0" y1="340" x2={W} y2="340" />
        {Array.from({ length: 41 }, (_, i) => (
          <line key={i} x1={i * 40} y1="340" x2={i * 40} y2="362" strokeWidth="2.5" />
        ))}
      </g>
      {/* twin staircases */}
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} fill="#252c39">
          <rect x={600 + i * 14} y={380 + i * 16} width="70" height="5" />
          <rect x={930 - i * 14} y={380 + i * 16} width="70" height="5" />
        </g>
      ))}
      <line x1="600" y1="370" x2="768" y2="570" stroke="#3a4253" strokeWidth="4" />
      <line x1="1000" y1="370" x2="832" y2="570" stroke="#3a4253" strokeWidth="4" />

      <Placard x={140} y={440} />
      <Placard x={300} y={500} />
      <Placard x={1300} y={500} />
      <Placard x={1460} y={440} />

      {/* red alarm beacons */}
      {[{ x: 300, y: 290 }, { x: 1300, y: 290 }].map((b, i) => (
        <g key={i}>
          <line x1={b.x} y1="120" x2={b.x} y2={b.y - 30} stroke="#2a303c" strokeWidth="4" />
          <circle cx={b.x} cy={b.y} r="150" fill={`url(#${p}-red)`} className="xr-war-beacon" style={{ animationDelay: `-${i * 1.1}s` }} />
          <rect x={b.x - 26} y={b.y - 30} width="52" height="56" rx="10" fill="#141820" />
          <circle cx={b.x + (i ? -10 : 10)} cy={b.y} r="13" fill="#ff5a5a" />
        </g>
      ))}
      {/* ceiling spot lamps */}
      {[500, 1100, 470].map((x, i) => (
        <circle key={i} cx={x} cy={i === 2 ? 480 : 175} r="26" fill={`url(#${p}-lamp)`} />
      ))}

      {/* lower floor + glowing grid */}
      <rect x="0" y="560" width={W} height="440" fill="#080b12" />
      {/* lower-level back wall: panels, a red-lit side room, wall consoles */}
      <rect x="0" y="560" width={W} height="130" fill="#0e131d" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={i * 100 + 8} y="572" width="84" height="106" fill="none" stroke="#1c2331" strokeWidth="2" />
      ))}
      <rect x="250" y="590" width="120" height="100" fill="#2a0d10" />
      <rect x="262" y="640" width="96" height="16" fill="#ef4444" opacity="0.55" />
      <rect x="250" y="590" width="120" height="100" fill="#ff4d4d" opacity="0.12" className="xr-war-beacon" />
      <rect x="1160" y="595" width="70" height="95" fill="#d9e6f7" opacity="0.18" />
      <Console x={20} y={630} w={200} glow="#a7f3d0" />
      <Console x={1250} y={630} w={180} />
      <Console x={1450} y={630} w={140} glow="#86efac" />
      {[180, 1420].map((x) => (
        <circle key={x} cx={x} cy="600" r="22" fill={`url(#${p}-lamp)`} opacity="0.8" />
      ))}
      <path d="M520 1000 L620 900 L980 900 L1080 1000Z" fill={`url(#${p}-floor)`} opacity="0.95" />
      <g stroke="#ffcf8a" strokeWidth="1.5" opacity="0.55">
        {Array.from({ length: 13 }, (_, i) => {
          const t = i / 12;
          return <line key={i} x1={620 + t * 360} y1="900" x2={520 + t * 560} y2="1000" />;
        })}
        {[915, 935, 960, 990].map((y) => {
          const k = (y - 900) / 100;
          return <line key={y} x1={620 - k * 100} y1={y} x2={980 + k * 100} y2={y} />;
        })}
      </g>

      {/* main world-map screen */}
      <rect x={mapX - 22} y={mapY - 22} width={mapW + 44} height={mapH + 52} fill="#151a22" />
      <rect x={mapX} y={mapY} width={mapW} height={mapH} fill={`url(#${p}-screen)`} />
      <g transform={`translate(${mapX} ${mapY}) scale(${sx} ${sy})`} fill="#0b0f17">
        {LAND.map((d, i) => <path key={i} d={d} />)}
      </g>
      {BLIPS.map((b, i) => (
        <circle key={i} cx={mapX + b.x * sx} cy={mapY + b.y * sy} r="5" fill="#ef4444" className="xr-war-blip" style={{ animationDelay: `-${i * 0.6}s` }} />
      ))}
      <rect x={mapX + 120} y={mapY + mapH + 8} width="160" height="14" fill="#0b0f17" />
      {/* side consoles framing the screen */}
      <path d="M1040 700 L1250 640 L1300 1000 L1060 1000Z" fill="#1a1f29" />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={1060 + i * 16} y={740 + i * 34} width="10" height="28" fill="#60a5fa" opacity="0.75" className="xr-war-flicker" style={{ animationDelay: `-${i}s` }} />
      ))}
      <path d="M380 740 L560 700 L560 1000 L340 1000Z" fill="#141922" />
      <Console x={380} y={760} w={150} />
    </svg>
  );
}
