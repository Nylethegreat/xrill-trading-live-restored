// Decorative "neural pulse" visual for the Intelligence page header --
// a stylized brain silhouette (two overlapping lobe curves) with a few
// glowing neuron nodes pulsing on a staggered delay, slowly drifting.
// Purely aria-hidden/pointer-events-none.
const NEURONS = [
  { cx: 40, cy: 30, delay: "0s" },
  { cx: 62, cy: 45, delay: "0.5s" },
  { cx: 30, cy: 55, delay: "1s" },
  { cx: 55, cy: 65, delay: "0.3s" },
  { cx: 72, cy: 28, delay: "0.8s" },
];

export default function PulseBrain({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none motion-safe:animate-star-drift ${className}`}>
      <svg viewBox="0 0 90 90" className="h-full w-full overflow-visible drop-shadow-[0_0_10px_rgba(96,165,250,0.55)]">
        {/* stylized brain silhouette -- two overlapping lobe curves */}
        <path
          d="M45 12
             C 25 10, 12 24, 14 40
             C 6 46, 8 62, 20 66
             C 22 76, 36 82, 45 76
             C 54 82, 68 76, 70 66
             C 82 62, 84 46, 76 40
             C 78 24, 65 10, 45 12 Z"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="1.4"
          opacity="0.55"
        />
        {/* central fissure, brain-like detail */}
        <path d="M45 14 C 44 30, 46 55, 45 76" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.35" />
        {NEURONS.map((n) => (
          <circle
            key={n.cx}
            cx={n.cx}
            cy={n.cy}
            r="3"
            fill="#bfdbfe"
            className="motion-safe:animate-candle-pulse"
            style={{ animationDelay: n.delay, transformOrigin: `${n.cx}px ${n.cy}px` }}
          />
        ))}
      </svg>
    </div>
  );
}
