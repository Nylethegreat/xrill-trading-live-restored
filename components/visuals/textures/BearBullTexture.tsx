// Bear vs Bull: a red bear and a green bull squaring off on black, a white
// lightning bolt cracking between them, each with its trend arrow. Original
// silhouettes and composition. The two glows breathe out of phase and the
// bolt flickers — red and green take turns winning the room.

const W = 1600;
const H = 1000;

// Bear facing left, drawn in a ~300x175 box.
const BEAR =
  "M6 96 C8 90 18 86 32 84 C38 74 44 66 52 62 C52 52 60 44 70 44 C78 44 82 50 80 56 C86 54 92 54 96 56 C104 46 114 40 126 40 C150 40 176 48 200 52 C230 56 262 60 280 76 C294 90 296 112 290 126 L292 175 L264 175 L262 140 C252 136 244 132 238 128 L236 175 L210 175 L210 128 C186 126 160 126 140 128 L138 175 L112 175 L110 130 C104 128 98 126 94 124 L92 175 L66 175 L68 120 C58 116 48 112 38 108 C24 106 14 104 6 96Z";
// Bull facing right, ~320x175 box, with horns.
const BULL =
  "M302 82 C304 96 297 105 285 107 C277 111 267 113 259 111 L251 125 C253 141 251 151 247 161 L249 176 L228 176 L227 151 C209 149 190 147 172 147 L171 176 L150 176 L150 147 C120 147 96 145 78 141 L76 176 L55 176 L56 137 C44 133 34 125 30 111 C21 110 11 114 4 120 C7 105 19 97 31 97 C40 71 70 59 110 57 C150 55 200 53 230 51 C243 42 255 40 266 47 C272 41 279 37 290 33 C301 29 311 21 318 9 C319 25 309 38 294 44 C292 52 296 63 302 82Z";
const BULL_HORN2 = "M262 46 C258 34 252 26 240 20 C250 30 254 38 255 48Z";

export default function BearBullTexture({ className = "", idPrefix = "bb", still = false }: { className?: string; idPrefix?: string; still?: boolean }) {
  const p = idPrefix;
  const anim = (c: string) => (still ? undefined : c);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-red`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-green`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-bear`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id={`${p}-bull`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <filter id={`${p}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={W} height={H} fill="#030304" />
      <ellipse cx="560" cy="520" rx="520" ry="380" fill={`url(#${p}-red)`} className={anim("xr-breathe")} />
      <ellipse cx="1040" cy="500" rx="520" ry="380" fill={`url(#${p}-green)`} className={anim("xr-breathe-alt")} />

      {/* faint floor grid */}
      <g stroke="#ffffff" strokeOpacity="0.035">
        {Array.from({ length: 21 }, (_, i) => (
          <line key={i} x1={i * 80} y1="0" x2={i * 80} y2={H} />
        ))}
      </g>

      <g filter={`url(#${p}-glow)`}>
        <path d={BEAR} fill={`url(#${p}-bear)`} transform="translate(300 400) scale(1.75)" />
        <g transform="translate(300 400) scale(1.75)" fill="#7f1d1d">
          <circle cx="42" cy="76" r="3.2" />
          <circle cx="9" cy="93" r="3.6" />
        </g>
        <path d={BULL} fill={`url(#${p}-bull)`} transform="translate(800 390) scale(1.75)" />
        <path d={BULL_HORN2} fill="#22c55e" transform="translate(800 390) scale(1.75)" />
      </g>

      {/* trend arrows */}
      <path d="M490 450 L570 520 L610 490 L700 600" stroke="#7f1d1d" strokeWidth="14" fill="none" strokeLinejoin="round" opacity="0.8" />
      <path d="M676 612 L714 618 L706 580Z" fill="#7f1d1d" opacity="0.8" />
      <path d="M870 640 L980 520 L1030 560 L1180 420" stroke="#14532d" strokeWidth="14" fill="none" strokeLinejoin="round" opacity="0.85" />
      <path d="M1160 412 L1196 404 L1192 440Z" fill="#14532d" opacity="0.85" />

      {/* labels */}
      <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="64" letterSpacing="2" filter={`url(#${p}-glow)`}>
        <text x="520" y="370" fill="#ef4444">BEAR</text>
        <text x="930" y="350" fill="#22c55e">BULL</text>
      </g>

      {/* the bolt */}
      <g className={anim("xr-bolt")} filter={`url(#${p}-glow)`}>
        <path d="M842 300 L742 560 L812 556 L748 760 L900 470 L822 474 L902 300Z" fill="#ffffff" />
      </g>
    </svg>
  );
}
