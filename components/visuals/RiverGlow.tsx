// A slow, winding river flowing down the margin of the Glossary page --
// purely decorative, deterministic (no Math.random, so server/client
// hydration always matches), following the same pattern as
// CandlestickGlow/NeuronPulse: gradient <defs>, a soft blur glow, and a
// native SVG SMIL <animate> for motion instead of a CSS keyframe (CSS
// background-position animations don't apply to SVG strokes/fills).

const BENDS = [
  { cx: 40, cy: 40 },
  { cx: 20, cy: 140 },
  { cx: 55, cy: 240 },
  { cx: 15, cy: 340 },
  { cx: 45, cy: 440 },
  { cx: 25, cy: 540 },
  { cx: 50, cy: 640 },
  { cx: 20, cy: 740 },
  { cx: 40, cy: 840 },
];

const PATH = `M ${BENDS[0].cx} ${BENDS[0].cy} ` + BENDS.slice(1).map((b) => `S ${b.cx} ${b.cy - 50}, ${b.cx} ${b.cy}`).join(" ");

// A few glints that drift down the current -- staggered offsets/durations
// so they never line up.
const GLINTS = [
  { offset: "0%", duration: "9s", delay: "0s", size: 3 },
  { offset: "0%", duration: "11s", delay: "-3s", size: 2 },
  { offset: "0%", duration: "8s", delay: "-6s", size: 2.5 },
  { offset: "0%", duration: "13s", delay: "-1.5s", size: 2 },
];

// Reeds/stones along the bank for a bit of texture.
const BANK_MARKS = [
  { x: 62, y: 90 },
  { x: 4, y: 190 },
  { x: 70, y: 300 },
  { x: 0, y: 400 },
  { x: 65, y: 500 },
  { x: 6, y: 600 },
  { x: 68, y: 700 },
  { x: 2, y: 800 },
];

export default function RiverGlow() {
  return (
    <svg
      viewBox="0 0 80 880"
      width="80"
      height="880"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="riverWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
        </linearGradient>
        <filter id="riverGlowBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* soft glow behind the river */}
      <path d={PATH} fill="none" stroke="#3b82f6" strokeOpacity="0.25" strokeWidth="14" filter="url(#riverGlowBlur)" />

      {/* the river itself */}
      <path d={PATH} fill="none" stroke="url(#riverWater)" strokeWidth="6" strokeLinecap="round" />

      {/* current -- a moving dash pattern along the same path */}
      <path
        d={PATH}
        fill="none"
        stroke="#e0f2fe"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeDasharray="2 10"
        strokeLinecap="round"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="3.5s" repeatCount="indefinite" />
      </path>

      {/* glints drifting along the current */}
      {GLINTS.map((g, i) => (
        <circle key={i} r={g.size} fill="#e0f2fe" opacity="0.8">
          <animateMotion dur={g.duration} begin={g.delay} repeatCount="indefinite" rotate="auto">
            <mpath href="#riverPathRef" />
          </animateMotion>
          <animate attributeName="opacity" values="0;0.9;0" dur={g.duration} begin={g.delay} repeatCount="indefinite" />
        </circle>
      ))}
      <path id="riverPathRef" d={PATH} fill="none" opacity="0" />

      {/* bank texture */}
      {BANK_MARKS.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r="1.6" fill="#22c55e" opacity="0.35" />
      ))}
    </svg>
  );
}
