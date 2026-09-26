// Full-bleed decorative background: a deep, mossy-green forest mood --
// soft blurred moss blobs, faint vertical "trunk" lines, and a slow
// breathing glow. Pure inline SVG/CSS, deterministic (no Math.random),
// low-opacity by design so it stays a backdrop, never competes with the
// account page's real content sitting on top of it.
export default function MossyForestTexture({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full" width="100%" height="100%">
        <defs>
          <radialGradient id="mossBg" cx="30%" cy="20%" r="90%">
            <stop offset="0%" stopColor="#14532d" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#052e16" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#07080f" stopOpacity="0" />
          </radialGradient>
          <filter id="mossBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>
        <rect width="800" height="1000" fill="url(#mossBg)" />

        {/* soft moss blobs, breathing slowly */}
        <g filter="url(#mossBlur)" className="animate-orb-float">
          <ellipse cx="120" cy="180" rx="160" ry="110" fill="#22c55e" opacity="0.14" />
          <ellipse cx="650" cy="360" rx="200" ry="140" fill="#16a34a" opacity="0.12" />
          <ellipse cx="260" cy="760" rx="220" ry="150" fill="#15803d" opacity="0.15" />
          <ellipse cx="700" cy="880" rx="150" ry="110" fill="#22c55e" opacity="0.1" />
        </g>

        {/* faint tree-trunk verticals */}
        <g stroke="#166534" strokeOpacity="0.25" strokeWidth="10" strokeLinecap="round">
          <line x1="80" y1="0" x2="70" y2="1000" />
          <line x1="240" y1="0" x2="260" y2="1000" />
          <line x1="430" y1="0" x2="420" y2="1000" />
          <line x1="600" y1="0" x2="615" y2="1000" />
          <line x1="740" y1="0" x2="730" y2="1000" />
        </g>

        {/* faint leaf-litter dots */}
        <g fill="#4ade80" opacity="0.2">
          {Array.from({ length: 24 }).map((_, i) => {
            const x = (i * 137) % 800;
            const y = (i * 251) % 1000;
            return <circle key={i} cx={x} cy={y} r={2.5} />;
          })}
        </g>
      </svg>
    </div>
  );
}
