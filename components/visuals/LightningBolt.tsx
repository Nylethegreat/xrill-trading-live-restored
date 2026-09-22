// Decorative flickering diagonal lightning bolt. Pure CSS/SVG,
// aria-hidden/pointer-events-none. Uses the existing neon-flicker
// keyframe (tailwind.config.ts) for the "electric" on/off feel rather
// than a new animation. `color` swaps both the stroke and the glow --
// defaults to the gold used on the Account page.
export default function LightningBolt({
  className = "",
  color = "#facc15",
  glow = "rgba(250,204,21,0.9)",
}: {
  className?: string;
  color?: string;
  glow?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 400"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute z-0 motion-safe:animate-neon-flicker ${className}`}
    >
      <path
        d="M120 0 L40 190 L95 190 L60 400 L170 150 L110 150 Z"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${glow}) drop-shadow(0 0 16px ${glow})` }}
      />
    </svg>
  );
}
