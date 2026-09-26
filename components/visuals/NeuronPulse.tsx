// Decorative "blue neurons firing" backdrop for the Intelligence page —
// a small branching network of axons (SVG paths) with synapse nodes that
// flash and a dashed "impulse" that runs the length of each path on a
// loop. Pure inline SVG, deterministic geometry (no Math.random), same
// approach as CandlestickGlow/PulseBrain. Absolutely positioned,
// pointer-events-none; meant to sit behind page content inside a
// `relative` ancestor.

const PATHS = [
  { d: "M40,180 C120,120 160,200 240,140 S360,80 440,120", delay: "0s" },
  { d: "M20,60 C90,100 140,40 220,90 S320,150 420,70", delay: "-0.7s" },
  { d: "M60,260 C140,220 190,280 260,230 S380,190 460,240", delay: "-1.4s" },
  { d: "M10,140 C80,180 130,120 210,160 S330,220 430,180", delay: "-2.1s" },
];

const NODES = [
  { cx: 40, cy: 180, delay: "0s" },
  { cx: 240, cy: 140, delay: "0.4s" },
  { cx: 440, cy: 120, delay: "0.9s" },
  { cx: 20, cy: 60, delay: "0.2s" },
  { cx: 220, cy: 90, delay: "0.7s" },
  { cx: 420, cy: 70, delay: "1.1s" },
  { cx: 60, cy: 260, delay: "0.5s" },
  { cx: 260, cy: 230, delay: "1s" },
  { cx: 460, cy: 240, delay: "1.5s" },
  { cx: 10, cy: 140, delay: "0.3s" },
  { cx: 210, cy: 160, delay: "0.8s" },
  { cx: 430, cy: 180, delay: "1.3s" },
];

export default function NeuronPulse({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 320"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="neuronLine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.5" />
        </linearGradient>
        <filter id="neuronGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* faint static axon lines */}
      <g stroke="url(#neuronLine)" strokeWidth="1.5" fill="none">
        {PATHS.map((p, i) => (
          <path key={i} d={p.d} />
        ))}
      </g>

      {/* the traveling impulse -- a short bright dash scrolling along each path */}
      <g stroke="#93c5fd" strokeWidth="2.5" fill="none" filter="url(#neuronGlow)">
        {PATHS.map((p, i) => (
          <path
            key={i}
            d={p.d}
            strokeDasharray="16 224"
            className="animate-neuron-impulse"
            style={{ animationDelay: p.delay }}
          />
        ))}
      </g>

      {/* synapse nodes, flashing on their own staggered cadence */}
      <g fill="#67e8f9" filter="url(#neuronGlow)">
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={3}
            className="animate-neuron-flash"
            style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: n.delay }}
          />
        ))}
      </g>
    </svg>
  );
}
