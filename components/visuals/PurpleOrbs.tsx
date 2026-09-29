// Decorative floating orbs for the Analytics backdrop. Pure CSS
// (radial-gradient blurred divs), deterministic placement/sizing/delay so
// server and client render identically — same "no Math.random" rule as
// CandlestickGlow. Absolutely positioned, pointer-events-none, meant to sit
// behind page content inside a `relative` ancestor.
//
// `palette` switches between the original purple/magenta and a warm
// "sunset" amber/rose that pairs with the falling leaves.

export type OrbPalette = "purple" | "sunset";

const ORBS = [
  { top: "4%", left: "8%", size: 180, delay: "0s", duration: "24s", tone: "a" },
  { top: "18%", left: "72%", size: 140, delay: "-6s", duration: "20s", tone: "b" },
  { top: "58%", left: "4%", size: 120, delay: "-12s", duration: "26s", tone: "a" },
  { top: "68%", left: "82%", size: 200, delay: "-3s", duration: "22s", tone: "b" },
  { top: "38%", left: "46%", size: 90, delay: "-9s", duration: "18s", tone: "a" },
  { top: "84%", left: "40%", size: 160, delay: "-15s", duration: "28s", tone: "b" },
] as const;

const TONE_CLASS: Record<OrbPalette, Record<"a" | "b", string>> = {
  purple: { a: "bg-blocked", b: "bg-secondary" },
  sunset: { a: "bg-orange-500", b: "bg-rose-500" },
};

export default function PurpleOrbs({
  className = "",
  palette = "purple",
}: {
  className?: string;
  palette?: OrbPalette;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className={`absolute animate-orb-float rounded-full blur-2xl transition-colors duration-700 ${TONE_CLASS[palette][orb.tone]}`}
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            animationDuration: orb.duration,
            animationDelay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
