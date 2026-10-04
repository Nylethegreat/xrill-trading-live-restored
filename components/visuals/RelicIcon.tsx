import type { RelicId } from "@/lib/data/relics";

// Original inline-SVG artwork for the twelve stage relics (no external
// images, nothing traced from any game). Locked relics render as a dark
// silhouette with a faint outline — you can see the shape you're working
// toward, not the colors.

const G = (id: string, a: string, b: string, vertical = true) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? "0" : "1"} y2={vertical ? "1" : "0"}>
    <stop offset="0%" stopColor={a} />
    <stop offset="100%" stopColor={b} />
  </linearGradient>
);

function Art({ id }: { id: RelicId }) {
  switch (id) {
    case "scroll":
      return (
        <>
          <defs>{G("rl-parch", "#fef3c7", "#d6a85c")}</defs>
          <rect x="10" y="12" width="28" height="24" rx="2" fill="url(#rl-parch)" />
          <rect x="7" y="9" width="34" height="5" rx="2.5" fill="#7c4a1e" />
          <rect x="7" y="34" width="34" height="5" rx="2.5" fill="#7c4a1e" />
          <circle cx="7" cy="11.5" r="2.5" fill="#fbbf24" />
          <circle cx="41" cy="11.5" r="2.5" fill="#fbbf24" />
          <circle cx="7" cy="36.5" r="2.5" fill="#fbbf24" />
          <circle cx="41" cy="36.5" r="2.5" fill="#fbbf24" />
          <path d="M15 19h18M15 23h14M15 27h16" stroke="#7c4a1e" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          <circle cx="31" cy="30" r="3.4" fill="#dc2626" />
          <path d="M29.6 30h2.8M31 28.6v2.8" stroke="#fecaca" strokeWidth="0.9" />
        </>
      );
    case "key":
      return (
        <>
          <defs>{G("rl-iron", "#e5e7eb", "#6b7280")}</defs>
          <circle cx="16" cy="16" r="9" fill="none" stroke="url(#rl-iron)" strokeWidth="4" />
          <circle cx="16" cy="16" r="3.2" fill="#e879f9" />
          <path d="M22 22 L39 39" stroke="url(#rl-iron)" strokeWidth="4" strokeLinecap="round" />
          <path d="M33 33 l4 -4 M36.5 36.5 l3 -3" stroke="url(#rl-iron)" strokeWidth="3.5" strokeLinecap="round" />
        </>
      );
    case "elixir":
      return (
        <>
          <defs>
            {G("rl-glass", "#ffffff", "#94a3b8")}
            <radialGradient id="rl-brew" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
          </defs>
          <rect x="20" y="5" width="8" height="5" rx="1.5" fill="#92400e" />
          <path d="M21 10h6v7c6 2 10 7 10 13 0 8-6 13-13 13S11 38 11 30c0-6 4-11 10-13z" fill="url(#rl-glass)" opacity="0.35" stroke="#e2e8f0" strokeWidth="1.2" />
          <path d="M13.5 29c3 2 18 2 21 0 0 7-5 11.5-10.5 11.5S13.5 36 13.5 29z" fill="url(#rl-brew)" />
          <circle cx="20" cy="33" r="1.4" fill="#fff7ed" opacity="0.9" />
          <circle cx="27" cy="36" r="1" fill="#fff7ed" opacity="0.8" />
          <path d="M17 19c-2 2-3 5-3 8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        </>
      );
    case "tablet":
      return (
        <>
          <defs>{G("rl-stone", "#d6d3d1", "#57534e")}</defs>
          <path d="M12 42V14c0-6 5-10 12-10s12 4 12 10v28z" fill="url(#rl-stone)" stroke="#292524" strokeWidth="1" />
          <path d="M17 15h14M17 20h10M17 25h14M17 30h8M17 35h12" stroke="#7e22ce" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M33 9l-4 6" stroke="#44403c" strokeWidth="0.8" />
        </>
      );
    case "tome":
      return (
        <>
          <defs>{G("rl-cover", "#7dd3fc", "#1e3a8a")}</defs>
          <rect x="9" y="7" width="28" height="34" rx="2" fill="url(#rl-cover)" />
          <rect x="35" y="9" width="5" height="30" fill="#f1f5f9" />
          <rect x="9" y="7" width="4" height="34" fill="#172554" />
          <path d="M23 15 l5 9 -5 9 -5 -9z" fill="#fbbf24" stroke="#fef3c7" strokeWidth="0.8" />
          <circle cx="23" cy="24" r="2" fill="#38bdf8" />
        </>
      );
    case "hologram":
      return (
        <>
          <defs>
            <linearGradient id="rl-beam" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M14 38 L24 10 L34 38z" fill="url(#rl-beam)" />
          <path d="M24 9 l8 7 -8 9 -8 -9z" fill="none" stroke="#fda4af" strokeWidth="1.5" />
          <path d="M16 16h16M24 9v16" stroke="#fda4af" strokeWidth="0.8" opacity="0.7" />
          <path d="M14 30h20M16 26h16" stroke="#fecdd3" strokeWidth="0.6" opacity="0.5" />
          <ellipse cx="24" cy="39" rx="12" ry="3.5" fill="#334155" stroke="#f43f5e" strokeWidth="1.2" />
          <ellipse cx="24" cy="38.4" rx="6" ry="1.4" fill="#fb7185" />
        </>
      );
    case "scarab":
      return (
        <>
          <defs>{G("rl-gold", "#fde68a", "#b45309")}</defs>
          <path d="M22 18 C10 12 3 20 4 30 C10 27 16 26 21 26z" fill="url(#rl-gold)" opacity="0.85" />
          <path d="M26 18 C38 12 45 20 44 30 C38 27 32 26 27 26z" fill="url(#rl-gold)" opacity="0.85" />
          <ellipse cx="24" cy="29" rx="7" ry="10" fill="url(#rl-gold)" stroke="#78350f" strokeWidth="0.8" />
          <path d="M24 20v18" stroke="#78350f" strokeWidth="0.9" />
          <circle cx="24" cy="15" r="4" fill="url(#rl-gold)" />
          <circle cx="24" cy="8.5" r="3.4" fill="#16a34a" stroke="#fde68a" strokeWidth="0.8" />
          <path d="M18 34l-5 5M30 34l5 5M18 28l-6 1M30 28l6 1" stroke="#b45309" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case "sundisk":
      return (
        <>
          <defs>
            <radialGradient id="rl-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>
            {G("rl-wing", "#fde68a", "#ca8a04", false)}
          </defs>
          <path d="M18 20 C10 16 4 17 2 20 C8 21 12 23 17 25z" fill="url(#rl-wing)" />
          <path d="M30 20 C38 16 44 17 46 20 C40 21 36 23 31 25z" fill="url(#rl-wing)" />
          <circle cx="24" cy="21" r="8" fill="url(#rl-sun)" />
          <ellipse cx="24" cy="30.5" rx="3.6" ry="4.2" fill="none" stroke="#fbbf24" strokeWidth="2.4" />
          <path d="M24 34.5v9M19 36.5h10" stroke="#fbbf24" strokeWidth="2.6" strokeLinecap="round" />
        </>
      );
    case "energy":
      return (
        <>
          <defs>{G("rl-cap", "#fed7aa", "#c2410c", false)}</defs>
          <rect x="8" y="17" width="32" height="14" rx="7" fill="url(#rl-cap)" stroke="#ffedd5" strokeWidth="1" transform="rotate(-30 24 24)" />
          <path d="M26 12 l-6 12 h5 l-3 12 9-15 h-5 z" fill="#fef08a" stroke="#fff" strokeWidth="0.6" />
        </>
      );
    case "timecapsule":
      return (
        <>
          <defs>{G("rl-sand", "#f5d0fe", "#a855f7")}</defs>
          <rect x="12" y="5" width="24" height="4" rx="1.5" fill="#6b21a8" />
          <rect x="12" y="39" width="24" height="4" rx="1.5" fill="#6b21a8" />
          <path d="M15 9 h18 c0 8 -7 11 -7 15 c0 4 7 7 7 15 h-18 c0 -8 7 -11 7 -15 c0 -4 -7 -7 -7 -15z" fill="#ffffff" fillOpacity="0.15" stroke="#e9d5ff" strokeWidth="1.2" />
          <path d="M18 13 h12 c-1 4 -4 6 -6 8 c-2 -2 -5 -4 -6 -8z" fill="url(#rl-sand)" />
          <path d="M17 38 c1 -4 4 -6 7 -7 c3 1 6 3 7 7z" fill="url(#rl-sand)" />
          <path d="M24 22 v8" stroke="#f0abfc" strokeWidth="1" strokeDasharray="1.5 1.5" />
        </>
      );
    case "jewel":
      return (
        <>
          <defs>
            <linearGradient id="rl-prism" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="35%" stopColor="#93c5fd" />
              <stop offset="70%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>
          <path d="M12 17 L18 9 H30 L36 17 L24 41 Z" fill="url(#rl-prism)" stroke="#fff" strokeWidth="1" />
          <path d="M12 17 H36 M18 9 L22 17 L24 41 M30 9 L26 17 L24 41 M22 17 L24 9 L26 17" stroke="#fff" strokeWidth="0.7" fill="none" opacity="0.7" />
        </>
      );
    case "anubis":
      return (
        <>
          <defs>{G("rl-anubis", "#fef08a", "#a16207")}</defs>
          {/* pedestal */}
          <rect x="9" y="39" width="30" height="5" rx="1" fill="url(#rl-anubis)" stroke="#713f12" strokeWidth="0.6" />
          {/* seated jackal-headed guardian, side profile */}
          <path
            d="M17 8 L19 16 L21 9 L23 17 C26 17 29 18 30 21 L35 23 L34 25 L29 25 C28 27 27 28 26 29 L27 35 L33 36 L33 39 L14 39 L15 31 C14 27 15 22 18 19 Z"
            fill="url(#rl-anubis)"
            stroke="#713f12"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <circle cx="26.5" cy="21" r="1" fill="#1e293b" />
          {/* striped headdress band */}
          <path d="M18 19 L16 29 M20 18.5 L18.5 29" stroke="#1d4ed8" strokeWidth="1.4" />
          {/* staff */}
          <path d="M37 39 V14 M35 14 h4" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
        </>
      );
  }
}

export default function RelicIcon({ id, unlocked, size = 44, glow }: { id: RelicId; unlocked: boolean; size?: number; glow?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      style={
        unlocked
          ? { filter: glow ? `drop-shadow(0 0 6px ${glow})` : undefined }
          : { filter: "brightness(0) drop-shadow(0 0 1px rgba(255,255,255,0.55))", opacity: 0.75 }
      }
    >
      <Art id={id} />
    </svg>
  );
}
