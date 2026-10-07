// Hometown: a quiet suburban street just after sunset. Gabled roofs in a
// row against a purple-to-rose sky, a few warm windows, one street lamp
// glowing over a rain-wet road that reflects it. Original SVG art.
//
// Performance: no blur filters. The lamp glow and reflections are radial /
// linear gradients; the only motion is a slow lamp flicker and two windows
// that switch on and off, each a tiny element.

const W = 1600;
const H = 1000;
const STREET = 760; // where the houses meet the lawn/sidewalk

interface House {
  x: number;
  w: number;
  wall: number; // wall height
  roof: number; // roof peak height above wall
  garage: boolean;
  lit: number[]; // indexes of lit windows
  shade: string;
}

const HOUSES: House[] = [
  { x: -40, w: 300, wall: 150, roof: 110, garage: true, lit: [1], shade: "#2a1f2e" },
  { x: 250, w: 260, wall: 170, roof: 120, garage: false, lit: [0, 3], shade: "#2f2233" },
  { x: 500, w: 330, wall: 160, roof: 130, garage: true, lit: [2], shade: "#2b2030" },
  { x: 820, w: 280, wall: 175, roof: 115, garage: false, lit: [], shade: "#30243a" },
  { x: 1090, w: 320, wall: 155, roof: 125, garage: true, lit: [0], shade: "#2a1f2f" },
  { x: 1400, w: 260, wall: 165, roof: 110, garage: false, lit: [1, 2], shade: "#2d2134" },
];

function HouseShape({ h, i, still }: { h: House; i: number; still: boolean }) {
  const top = STREET - h.wall;
  const peak = top - h.roof;
  const win = [0, 1, 2, 3].map((k) => ({
    x: h.x + 34 + (k % 2) * (h.w * 0.42),
    y: top + 28 + Math.floor(k / 2) * 62,
  }));
  return (
    <g>
      {/* wall */}
      <rect x={h.x} y={top} width={h.w} height={h.wall} fill={h.shade} />
      {/* gabled roof with slight overhang */}
      <polygon points={`${h.x - 14},${top + 4} ${h.x + h.w / 2},${peak} ${h.x + h.w + 14},${top + 4}`} fill="#1b141f" />
      <polyline points={`${h.x - 14},${top + 4} ${h.x + h.w / 2},${peak} ${h.x + h.w + 14},${top + 4}`} fill="none" stroke="#f0a7a0" strokeOpacity="0.12" strokeWidth="3" />
      {/* windows */}
      {win.map((w, k) => {
        const lit = h.lit.includes(k);
        const blink = !still && lit && (i + k) % 3 === 0;
        return (
          <rect
            key={k}
            x={w.x}
            y={w.y}
            width="44"
            height="34"
            rx="2"
            fill={lit ? "#ffc77a" : "#140f18"}
            opacity={lit ? 0.85 : 0.9}
            className={blink ? "motion-safe:animate-[window-life_18s_steps(1)_infinite]" : undefined}
            style={blink ? { animationDelay: `${i * 3}s` } : undefined}
          />
        );
      })}
      {/* garage door */}
      {h.garage && (
        <g>
          <rect x={h.x + h.w - 128} y={STREET - 92} width="104" height="92" fill="#1c1520" />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={h.x + h.w - 128} x2={h.x + h.w - 24} y1={STREET - 92 + 23 * k} y2={STREET - 92 + 23 * k} stroke="#000" strokeOpacity="0.35" />
          ))}
        </g>
      )}
      {/* front door with a porch light */}
      <rect x={h.x + h.w * 0.45} y={STREET - 70} width="30" height="70" fill="#120d15" />
      {h.lit.length > 0 && <circle cx={h.x + h.w * 0.45 + 40} cy={STREET - 62} r="3" fill="#ffd28a" />}
    </g>
  );
}

export default function HometownTexture({ className = "", idPrefix = "home", still = false }: { className?: string; idPrefix?: string; still?: boolean }) {
  const p = idPrefix;
  const lampX = 1290;
  const lampTop = 470;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1e4a" />
          <stop offset="45%" stopColor="#4b2a5e" />
          <stop offset="75%" stopColor="#8c4659" />
          <stop offset="100%" stopColor="#a35a4c" />
        </linearGradient>
        <radialGradient id={`${p}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffe9b8" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#ffcf86" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffcf86" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b2230" />
          <stop offset="100%" stopColor="#0d0a10" />
        </linearGradient>
        <linearGradient id={`${p}-reflect`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd28a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd28a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-skyreflect`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8c4659" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8c4659" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${p}-sky)`} />
      {/* a soft band of cloud drifting across the dusk */}
      <g className={still ? undefined : "motion-safe:animate-[cloud-drift_80s_linear_infinite]"}>
        <ellipse cx="400" cy="210" rx="420" ry="40" fill="#f0a7a0" opacity="0.07" />
        <ellipse cx="1200" cy="160" rx="380" ry="34" fill="#c4b5fd" opacity="0.06" />
        <ellipse cx="2000" cy="210" rx="420" ry="40" fill="#f0a7a0" opacity="0.07" />
        <ellipse cx="2800" cy="160" rx="380" ry="34" fill="#c4b5fd" opacity="0.06" />
      </g>

      {/* a few distant trees behind the rooftops */}
      {[120, 470, 760, 1060, 1350].map((x, k) => (
        <ellipse key={k} cx={x} cy={STREET - 270 + (k % 2) * 20} rx={90 + (k % 3) * 20} ry="70" fill="#1d1525" opacity="0.8" />
      ))}

      {HOUSES.map((h, i) => (
        <HouseShape key={i} h={h} i={i} still={still} />
      ))}

      {/* lawn strip, sidewalk, curb, then the wet road */}
      <rect x="0" y={STREET} width={W} height="40" fill="#15111a" />
      <rect x="0" y={STREET + 40} width={W} height="34" fill="#2a2430" />
      <rect x="0" y={STREET + 74} width={W} height={H - STREET - 74} fill={`url(#${p}-road)`} />
      <rect x="0" y={STREET + 74} width={W} height="110" fill={`url(#${p}-skyreflect)`} />

      {/* street lamp */}
      <g>
        <circle
          cx={lampX - 40}
          cy={lampTop + 18}
          r="190"
          fill={`url(#${p}-lamp)`}
          className={still ? undefined : "motion-safe:animate-[lamp-flicker_9s_ease-in-out_infinite]"}
        />
        <line x1={lampX} y1={lampTop} x2={lampX} y2={STREET + 60} stroke="#120d15" strokeWidth="9" />
        <path d={`M${lampX} ${lampTop} q -6 -26 -40 -20`} stroke="#120d15" strokeWidth="7" fill="none" />
        <rect x={lampX - 58} y={lampTop - 8} width="30" height="12" rx="3" fill="#120d15" />
        <rect x={lampX - 54} y={lampTop + 4} width="22" height="5" fill="#fff1c9" />
        {/* reflection on the wet road */}
        <rect x={lampX - 70} y={STREET + 80} width="56" height={H - STREET - 80} fill={`url(#${p}-reflect)`} opacity="0.8" />
      </g>

      {/* reflections of the lit windows, broken up on the wet asphalt */}
      {[180, 640, 1500].map((x, k) => (
        <rect key={k} x={x} y={STREET + 96} width="26" height="120" fill={`url(#${p}-reflect)`} opacity="0.35" />
      ))}

      <style>{`
        @keyframes lamp-flicker { 0%,100% { opacity: .95; } 47% { opacity: .95; } 48% { opacity: .7; } 49% { opacity: .95; } 52% { opacity: .82; } 53% { opacity: .95; } }
        @keyframes window-life { 0%,60% { opacity: .85; } 61%,100% { opacity: .15; } }
        @keyframes cloud-drift { from { transform: translateX(0); } to { transform: translateX(-1600px); } }
      `}</style>
    </svg>
  );
}
