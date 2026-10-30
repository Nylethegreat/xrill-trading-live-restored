// Embroidered merit-badge versions of the three star unlocks. Original
// SVG: a twill fabric field, satin-stitched star, a thick merrowed rim
// with stitch marks, and a per-tier scene behind the star. Locked badges
// show as an unsewn pattern: chalk-dashed outlines on bare fabric.
export type BadgeKind = "purple" | "rainbow" | "prismatic";

const STAR = "M50 16 L58.9 39.6 L84 41.2 L64.4 56.9 L71 81 L50 67 L29 81 L35.6 56.9 L16 41.2 L41.1 39.6 Z";

const THEME: Record<BadgeKind, { rim: string; rimDark: string; field: string; fieldDark: string; star: [string, string]; thread: string }> = {
  purple: { rim: "#7c3aed", rimDark: "#4c1d95", field: "#1e1b4b", fieldDark: "#141238", star: ["#c084fc", "#7e22ce"], thread: "#e9d5ff" },
  rainbow: { rim: "#f59e0b", rimDark: "#b45309", field: "#38bdf8", fieldDark: "#0284c7", star: ["#fde047", "#f59e0b"], thread: "#fff7d6" },
  prismatic: { rim: "#e5e7eb", rimDark: "#9ca3af", field: "#0b0b12", fieldDark: "#050508", star: ["#f5d0fe", "#a21caf"], thread: "#ffffff" },
};

export default function StarBadge({
  kind,
  unlocked,
  size = 64,
  idSuffix = "",
  spin = false,
}: {
  kind: BadgeKind;
  unlocked: boolean;
  size?: number;
  idSuffix?: string;
  spin?: boolean;
}) {
  const t = THEME[kind];
  const id = (n: string) => `badge-${kind}-${n}${idSuffix}`;

  if (!unlocked) {
    // The pattern before it's sewn: bare fabric, chalk lines, a padlock.
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <circle cx="50" cy="50" r="47" fill="#1a1a22" />
        <circle cx="50" cy="50" r="46" fill="none" stroke={t.rim} strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#4a4a55" strokeWidth="0.8" strokeDasharray="2 3" />
        <path d={STAR} fill="none" stroke={t.star[0]} strokeOpacity="0.4" strokeWidth="1.3" strokeDasharray="3 2.5" strokeLinejoin="round" />
        <g transform="translate(62 62)">
          <rect x="0" y="6" width="16" height="12" rx="2" fill="#2a2a33" stroke="#8a8a95" strokeWidth="1" />
          <path d="M3.5 6 V3.5 a4.5 4.5 0 0 1 9 0 V6" fill="none" stroke="#8a8a95" strokeWidth="1.6" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]"
    >
      <defs>
        {/* Twill weave: fine diagonal threads over the field */}
        <pattern id={id("twill")} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="3" height="3" fill={t.field} />
          <rect width="1.4" height="3" fill={t.fieldDark} opacity="0.55" />
        </pattern>
        {/* Satin stitch: long parallel threads across the star */}
        <pattern id={id("satin")} width="1.6" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
          <rect width="1.6" height="100" fill={t.star[0]} />
          <rect width="0.5" height="100" fill={t.star[1]} opacity="0.45" />
        </pattern>
        <linearGradient id={id("shade")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <clipPath id={id("clip")}>
          <circle cx="50" cy="50" r="40" />
        </clipPath>
        <filter id={id("rough")} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" />
        </filter>
      </defs>

      {/* Field */}
      <circle cx="50" cy="50" r="41" fill={`url(#${id("twill")})`} />

      {/* Scene behind the star */}
      <g clipPath={`url(#${id("clip")})`}>
        {kind === "purple" &&
          [
            [24, 26], [76, 24], [20, 64], [80, 66], [32, 84], [70, 86], [50, 10],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 3}L${x + 1} ${y}L${x} ${y + 3}L${x - 1} ${y}Z M${x - 3} ${y}L${x} ${y - 1}L${x + 3} ${y}L${x} ${y + 1}Z`} fill={t.thread} opacity="0.85" />
          ))}
        {kind === "rainbow" &&
          ["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7"].map((c, i) => (
            <path key={c} d={`M${4 + i * 4} 88 A${46 - i * 4} ${40 - i * 4} 0 0 1 ${96 - i * 4} 88`} fill="none" stroke={c} strokeWidth="4" strokeDasharray="1.2 0.4" />
          ))}
        {kind === "rainbow" && (
          <g fill="#fff" opacity="0.9">
            <ellipse cx="24" cy="30" rx="9" ry="4" />
            <ellipse cx="78" cy="26" rx="8" ry="3.5" />
          </g>
        )}
        {kind === "prismatic" &&
          Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const colors = ["#f87171", "#fbbf24", "#a3e635", "#22d3ee", "#818cf8", "#f472b6"];
            return (
              <path
                key={i}
                d={`M50 50 L${50 + Math.cos(a - 0.09) * 60} ${50 + Math.sin(a - 0.09) * 60} L${50 + Math.cos(a + 0.09) * 60} ${50 + Math.sin(a + 0.09) * 60}Z`}
                fill={colors[i % colors.length]}
                opacity="0.75"
              />
            );
          })}
      </g>

      {/* Satin star with a sewn outline */}
      <g className={spin ? "motion-safe:animate-star-spin" : ""} style={{ transformOrigin: "50px 50px" }}>
        <path d={STAR} fill="#000" opacity="0.35" transform="translate(1.2 1.6)" />
        <path d={STAR} fill={`url(#${id("satin")})`} filter={`url(#${id("rough")})`} />
        <path d={STAR} fill={`url(#${id("shade")})`} />
        <path d={STAR} fill="none" stroke={t.star[1]} strokeWidth="2" strokeLinejoin="round" />
        <path d={STAR} fill="none" stroke={t.thread} strokeWidth="0.6" strokeDasharray="1.2 0.9" strokeLinejoin="round" opacity="0.9" />
        <ellipse cx="45" cy="50" rx="2" ry="3.2" fill="#111" />
        <ellipse cx="55" cy="50" rx="2" ry="3.2" fill="#111" />
        <circle cx="44.4" cy="48.6" r="0.7" fill="#fff" />
        <circle cx="54.4" cy="48.6" r="0.7" fill="#fff" />
      </g>

      {/* Merrowed rim: thick border with whip-stitch marks */}
      <circle cx="50" cy="50" r="44.5" fill="none" stroke={t.rimDark} strokeWidth="9" />
      <circle cx="50" cy="50" r="44.5" fill="none" stroke={t.rim} strokeWidth="7.5" />
      <circle cx="50" cy="50" r="44.5" fill="none" stroke={t.rimDark} strokeWidth="7.5" strokeDasharray="0.7 1.3" opacity="0.7" />
      <circle cx="50" cy="50" r="40.3" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.35" />
      <circle cx="50" cy="50" r="48.7" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}
