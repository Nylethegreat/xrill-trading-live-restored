import { mulberry32 } from "./seeded";

// Aurora: green and violet curtains of light rolling over a starry sky,
// above a dark ridge of snowy peaks and pines. Original SVG; the curtains
// sway via .xr-aurora / .xr-aurora-slow, still under reduced motion.
const W = 1600, H = 1000;
const r = mulberry32(3301);
const STARS = Array.from({ length: 160 }, () => ({ x: r() * W, y: r() * 700, rr: 0.5 + r() * 1.4, o: 0.3 + r() * 0.7 }));
const PINES = Array.from({ length: 70 }, (_, i) => ({ x: (i / 70) * W + r() * 20, h: 40 + r() * 70 }));

export default function AuroraTexture({ className = "", idPrefix = "aurora" }: { className?: string; idPrefix?: string }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050826" />
          <stop offset="60%" stopColor="#120c3a" />
          <stop offset="100%" stopColor="#1b1446" />
        </linearGradient>
        <linearGradient id={`${p}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a3e635" stopOpacity="0" />
          <stop offset="35%" stopColor="#4ade80" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
          <stop offset="45%" stopColor="#8b5cf6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
        </linearGradient>
        <filter id={`${p}-soft`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30" /></filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${p}-sky)`} />
      {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.rr} fill="#fff" opacity={s.o} />)}
      <g filter={`url(#${p}-soft)`} style={{ mixBlendMode: "screen" }}>
        <path className="xr-aurora" d="M-100 420 C 200 120 420 80 620 260 S 1000 520 1250 260 S 1600 60 1750 200 L1750 520 C 1500 420 1300 700 1000 640 S 500 420 200 640 S -100 700 -100 640Z" fill={`url(#${p}-g)`} />
        <path className="xr-aurora-slow" d="M200 200 C 420 20 700 60 860 240 S 1200 420 1450 160 L1500 460 C 1300 560 1100 480 900 520 S 500 520 300 460Z" fill={`url(#${p}-v)`} />
        <path className="xr-aurora" d="M-50 300 C 120 160 260 200 360 360 S 560 640 760 520 L760 700 C 520 760 300 640 -50 720Z" fill={`url(#${p}-g)`} opacity="0.7" style={{ animationDuration: "33s" }} />
      </g>
      <path d="M0 860 L180 720 L300 790 L460 650 L640 800 L820 700 L980 790 L1160 660 L1340 780 L1600 700 L1600 1000 L0 1000Z" fill="#cbd5e1" opacity="0.18" />
      <path d="M0 880 L180 760 L300 820 L460 700 L640 830 L820 740 L980 820 L1160 700 L1340 810 L1600 740 L1600 1000 L0 1000Z" fill="#0b0d1a" />
      {PINES.map((t, i) => <path key={i} d={`M${t.x} ${1000 - 60 - t.h} L${t.x + t.h * 0.22} ${1000 - 60} L${t.x - t.h * 0.22} ${1000 - 60}Z`} fill="#03040a" />)}
      <rect y="940" width={W} height="60" fill="#03040a" />
    </svg>
  );
}
