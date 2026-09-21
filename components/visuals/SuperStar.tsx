// Retro reward visual — a small floating star that drifts slowly and spins,
// purely decorative (aria-hidden, pointer-events-none). Drop it inside any
// `relative` container; it positions itself in a top corner by default so
// it never sits on top of real content or controls.
export default function SuperStar({
  className = "top-2 right-6",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 motion-safe:animate-star-drift ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="motion-safe:animate-star-spin drop-shadow-[0_0_10px_rgba(250,204,21,0.85)]"
      >
        <path
          d="M12 1.5 L14.7 8.8 L22.5 9.3 L16.3 14.1 L18.4 21.8 L12 17.4 L5.6 21.8 L7.7 14.1 L1.5 9.3 L9.3 8.8 Z"
          fill="#fde047"
          stroke="#fef9c3"
          strokeWidth="0.6"
        />
        {/* Mario-style eyes */}
        <ellipse cx="9.5" cy="12" rx="1" ry="1.6" fill="#111" />
        <ellipse cx="14.5" cy="12" rx="1" ry="1.6" fill="#111" />
      </svg>
    </div>
  );
}
