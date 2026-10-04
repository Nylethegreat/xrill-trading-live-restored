// A deep-indigo bloom of moon-jelly–style jellyfish drifting upward and
// pulsing — original SVG artwork. Each jelly rises from below the frame to
// above it on its own speed/delay (deterministic, so SSR and client match),
// while its bell squeezes and relaxes. Pure CSS animation (see globals.css
// .xr-jelly-*), paused under reduced motion.

const W = 1600;
const H = 1000;

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
const rand = mulberry32(9134);

const JELLIES = Array.from({ length: 22 }, (_, i) => ({
  x: (i / 22) * W + rand() * 90 - 45,
  s: 0.55 + rand() * 1.15,
  dur: 38 + rand() * 40,
  delay: rand() * 70,
  tilt: rand() * 30 - 15,
  pulse: 2.6 + rand() * 1.8,
  hue: rand(),
})).sort((a, b) => a.s - b.s); // small (far) first, big (near) on top

const MOTES = Array.from({ length: 60 }, () => ({ x: rand() * W, y: rand() * H, r: 0.6 + rand() * 1.6, o: 0.15 + rand() * 0.4 }));

function Jelly({ p, id }: { p: string; id: number }) {
  // centered at 0,0; bell radius 60
  return (
    <g>
      {/* trailing fringe */}
      {Array.from({ length: 13 }, (_, k) => {
        const x = -54 + k * 9;
        return <path key={k} d={`M${x} 4 q4 ${30 + (k % 3) * 8} -2 ${70 + (k % 4) * 10}`} stroke="#c4b5fd" strokeOpacity="0.28" strokeWidth="1" fill="none" />;
      })}
      {/* oral arms */}
      <path d="M-10 6 C-22 40 -4 60 -16 96" stroke="#ddd6fe" strokeOpacity="0.35" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M8 6 C20 42 2 62 14 100" stroke="#ddd6fe" strokeOpacity="0.3" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* bell */}
      <path d="M-60 0 C-60 -46 -30 -62 0 -62 C30 -62 60 -46 60 0 C40 9 -40 9 -60 0Z" fill={`url(#${p}-bell-${id})`} stroke="#e9d5ff" strokeOpacity="0.55" strokeWidth="1.4" />
      {/* inner rim */}
      <path d="M-50 -2 C-36 4 36 4 50 -2" stroke="#f5f3ff" strokeOpacity="0.35" strokeWidth="1" fill="none" />
      {/* four-loop clover */}
      {[0, 1, 2, 3].map((k) => {
        const a = (k * Math.PI) / 2 + Math.PI / 4;
        return (
          <ellipse
            key={k}
            cx={Math.cos(a) * 11}
            cy={-30 + Math.sin(a) * 11}
            rx="7"
            ry="9.5"
            transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * 11} ${-30 + Math.sin(a) * 11})`}
            fill="none"
            stroke="#f9a8d4"
            strokeOpacity="0.85"
            strokeWidth="2.6"
          />
        );
      })}
      {/* top highlight */}
      <ellipse cx="-14" cy="-44" rx="18" ry="7" fill="#fff" opacity="0.12" />
    </g>
  );
}

export default function JellyfishTexture({ className = "", idPrefix = "jelly", still = false }: { className?: string; idPrefix?: string; still?: boolean }) {
  const p = idPrefix;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="45%" r="80%">
          <stop offset="0%" stopColor="#3b2a8a" />
          <stop offset="55%" stopColor="#170f4a" />
          <stop offset="100%" stopColor="#06041a" />
        </radialGradient>
        {JELLIES.map((j, i) => (
          <radialGradient key={i} id={`${p}-bell-${i}`} cx="45%" cy="35%" r="70%">
            <stop offset="0%" stopColor={j.hue > 0.5 ? "#c4b5fd" : "#a5b4fc"} stopOpacity="0.75" />
            <stop offset="70%" stopColor={j.hue > 0.5 ? "#8b5cf6" : "#6366f1"} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.25" />
          </radialGradient>
        ))}
        <filter id={`${p}-soft`}>
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${p}-bg)`} />
      <g fill="#e0e7ff">
        {MOTES.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={m.r} opacity={m.o} />
        ))}
      </g>
      {JELLIES.map((j, i) => {
        const far = j.s < 0.9;
        // Base Y in 460..780 so the rise keyframes (+650 -> -1000px) carry
        // every jelly from fully below the frame to fully above it; with
        // reduced motion / still previews they just rest at that spot.
        const startY = still ? 140 + ((i * 137) % 760) : 460 + ((i * 97) % 320);
        return (
          <g
            key={i}
            className={still ? undefined : "xr-jelly-rise"}
            style={still ? undefined : { animationDuration: `${j.dur}s`, animationDelay: `-${j.delay}s` }}
          >
            <g transform={`translate(${j.x} ${startY}) rotate(${j.tilt}) scale(${j.s})`} filter={far ? `url(#${p}-soft)` : undefined} opacity={far ? 0.6 : 0.95}>
              <g className={still ? undefined : "xr-jelly-pulse"} style={still ? undefined : { animationDuration: `${j.pulse}s` }}>
                <Jelly p={p} id={i} />
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
