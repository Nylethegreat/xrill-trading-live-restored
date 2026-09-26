// Full-bleed decorative background: a dim stone/rock-wall mood -- irregular
// blocky facets in cool grays with faint bevel highlights, like weathered
// masonry lit from one side. Pure inline SVG, deterministic geometry (no
// Math.random), low-opacity so it stays a backdrop behind real content.
const BLOCKS: { x: number; y: number; w: number; h: number; shade: number }[] = [
  { x: 0, y: 0, w: 180, h: 140, shade: 0.08 },
  { x: 180, y: 0, w: 220, h: 100, shade: 0.14 },
  { x: 400, y: 0, w: 160, h: 160, shade: 0.1 },
  { x: 560, y: 0, w: 240, h: 120, shade: 0.16 },
  { x: 0, y: 140, w: 140, h: 160, shade: 0.12 },
  { x: 140, y: 100, w: 200, h: 180, shade: 0.09 },
  { x: 400, y: 160, w: 180, h: 140, shade: 0.15 },
  { x: 580, y: 120, w: 220, h: 180, shade: 0.11 },
  { x: 0, y: 300, w: 200, h: 180, shade: 0.13 },
  { x: 200, y: 280, w: 180, h: 160, shade: 0.08 },
  { x: 380, y: 300, w: 220, h: 200, shade: 0.14 },
  { x: 600, y: 300, w: 200, h: 160, shade: 0.1 },
  { x: 0, y: 480, w: 160, h: 200, shade: 0.16 },
  { x: 160, y: 440, w: 220, h: 220, shade: 0.09 },
  { x: 380, y: 500, w: 180, h: 180, shade: 0.12 },
  { x: 560, y: 460, w: 240, h: 220, shade: 0.15 },
  { x: 0, y: 680, w: 220, h: 180, shade: 0.1 },
  { x: 220, y: 660, w: 180, h: 200, shade: 0.14 },
  { x: 400, y: 680, w: 200, h: 180, shade: 0.08 },
  { x: 600, y: 680, w: 200, h: 200, shade: 0.13 },
  { x: 0, y: 860, w: 260, h: 140, shade: 0.12 },
  { x: 260, y: 860, w: 220, h: 140, shade: 0.16 },
  { x: 480, y: 860, w: 180, h: 140, shade: 0.09 },
  { x: 660, y: 860, w: 140, h: 140, shade: 0.14 },
];

export default function RockWallTexture({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <radialGradient id="rockVignette" cx="50%" cy="10%" r="90%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#07080f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="1000" fill="url(#rockVignette)" />
        <g>
          {BLOCKS.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#334155" opacity={b.shade} />
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none" stroke="#cbd5e1" strokeOpacity="0.06" strokeWidth="2" />
              {/* soft top-left bevel highlight */}
              <line x1={b.x + 3} y1={b.y + 3} x2={b.x + b.w - 3} y2={b.y + 3} stroke="#e2e8f0" strokeOpacity="0.08" strokeWidth="2" />
              <line x1={b.x + 3} y1={b.y + 3} x2={b.x + 3} y2={b.y + b.h - 3} stroke="#e2e8f0" strokeOpacity="0.08" strokeWidth="2" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
