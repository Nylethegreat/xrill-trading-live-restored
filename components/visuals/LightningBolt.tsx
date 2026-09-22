// Decorative flickering diagonal lightning bolt for the Account page.
// Pure CSS/SVG, aria-hidden/pointer-events-none. Uses the existing
// neon-flicker keyframe (tailwind.config.ts) for the "electric" on/off
// feel rather than a new animation.
export default function LightningBolt({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 400"
      className={`pointer-events-none absolute z-0 motion-safe:animate-neon-flicker ${className}`}
    >
      <path
        d="M120 0 L40 190 L95 190 L60 400 L170 150 L110 150 Z"
        fill="none"
        stroke="#facc15"
        strokeWidth="3"
        strokeLinejoin="round"
        className="[filter:drop-shadow(0_0_6px_rgba(250,204,21,0.9))_drop-shadow(0_0_16px_rgba(250,204,21,0.5))]"
      />
    </svg>
  );
}
