import { mulberry32 } from "./seeded";

// Quest Map: a top-down isometric night map -- dim rooms, shelves and desks
// on a blue-slate floor -- with one glowing waypoint "!" bobbing over a
// lit pad in the middle. The save point of the Playbook. Original SVG.
const W = 1600, H = 1000;
const r = mulberry32(4471);
// isometric helpers: tile (i,j) -> screen
const TW = 64, TH = 32, OX = 800, OY = 180;
const iso = (i: number, j: number) => ({ x: OX + (i - j) * (TW / 2), y: OY + (i + j) * (TH / 2) });
const BLOCKS = Array.from({ length: 26 }, () => {
  const i = Math.floor(r() * 22), j = Math.floor(r() * 22);
  return { i, j, w: 1 + Math.floor(r() * 3), d: 1 + Math.floor(r() * 2), h: 14 + r() * 40, c: r() > 0.6 ? "#3b2a1e" : "#1e293b" };
}).filter((b) => Math.abs(b.i - 11) + Math.abs(b.j - 11) > 4);

function box(i: number, j: number, w: number, d: number, h: number, c: string, k: number) {
  const a = iso(i, j), b = iso(i + w, j), cpt = iso(i + w, j + d), e = iso(i, j + d);
  const up = (pt: { x: number; y: number }) => `${pt.x},${pt.y - h}`;
  return (
    <g key={k}>
      <polygon points={`${e.x},${e.y} ${cpt.x},${cpt.y} ${up(cpt)} ${up(e)}`} fill={c} opacity="0.95" />
      <polygon points={`${b.x},${b.y} ${cpt.x},${cpt.y} ${up(cpt)} ${up(b)}`} fill={c} opacity="0.75" />
      <polygon points={`${up(a)} ${up(b)} ${up(cpt)} ${up(e)}`} fill={c} style={{ filter: "brightness(1.6)" }} />
    </g>
  );
}

export default function QuestMapTexture({ className = "", idPrefix = "quest" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  const center = iso(11, 11);
  const tiles = [];
  for (let i = 0; i < 24; i++)
    for (let j = 0; j < 24; j++) {
      const a = iso(i, j), b = iso(i + 1, j), c = iso(i + 1, j + 1), d = iso(i, j + 1);
      const dist = Math.hypot(i - 11.5, j - 11.5);
      tiles.push(
        <polygon key={`${i}-${j}`} points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`}
          fill={(i + j) % 2 ? "#141c2e" : "#172137"} stroke="#24324d" strokeWidth="1" opacity={Math.max(0.15, 1 - dist / 15)} />,
      );
    }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="55%" r="75%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#02040a" />
        </radialGradient>
        <radialGradient id={`${p}-pad`}>
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#2563eb" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
        <filter id={`${p}-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      <g>{tiles}</g>
      {BLOCKS.sort((a, b) => a.i + a.j - (b.i + b.j)).map((b, k) => box(b.i, b.j, b.w, b.d, b.h, b.c, k))}
      {/* waypoint */}
      <ellipse cx={center.x} cy={center.y + 16} rx="150" ry="70" fill={`url(#${p}-pad)`} />
      <ellipse className="xr-ripple" cx={center.x} cy={center.y + 16} rx="60" ry="26" fill="none" stroke="#93c5fd" strokeWidth="2" style={{ animationDuration: "2.6s" }} />
      <g className="xr-marker">
        <g filter={`url(#${p}-glow)`} opacity="0.9">
          <path d={`M${center.x} ${center.y - 150} c22 0 26 18 22 34 l-12 62 h-20 l-12 -62 c-4 -16 0 -34 22 -34z`} fill="#3b82f6" />
          <circle cx={center.x} cy={center.y - 30} r="13" fill="#3b82f6" />
        </g>
        <path d={`M${center.x} ${center.y - 150} c22 0 26 18 22 34 l-12 62 h-20 l-12 -62 c-4 -16 0 -34 22 -34z`} fill="#bfdbfe" />
        <circle cx={center.x} cy={center.y - 30} r="13" fill="#bfdbfe" />
      </g>
    </svg>
  );
}
