// Full-bleed decorative background: a dark cyberpunk-terminal mood -- a
// faint perspective grid, drifting scanlines, and a couple of magenta/cyan
// glow points. Pure inline SVG/CSS, deterministic, low-opacity so it stays
// a backdrop behind real account-page content sitting on top of it.
export default function DarkNeoTexture({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <radialGradient id="neoGlowA" cx="20%" cy="15%" r="40%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#07080f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="neoGlowB" cx="85%" cy="70%" r="40%">
            <stop offset="0%" stopColor="#c026d3" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#07080f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="1000" fill="url(#neoGlowA)" />
        <rect width="800" height="1000" fill="url(#neoGlowB)" />

        {/* faint grid */}
        <g stroke="#22d3ee" strokeOpacity="0.08" strokeWidth="1">
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={1000} />
          ))}
          {Array.from({ length: 21 }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={i * 50} x2={800} y2={i * 50} />
          ))}
        </g>

        {/* a single scanline sweeping top to bottom on a slow loop --
            native SVG SMIL animation, since CSS background-position
            animations don't apply to SVG fills */}
        <rect x="0" y="-40" width="800" height="40" fill="#67e8f9" opacity="0.06">
          <animate attributeName="y" from="-40" to="1000" dur="7s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}
