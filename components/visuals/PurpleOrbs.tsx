// Decorative floating purple orbs for the Analytics backdrop. Pure CSS
// (radial-gradient blurred divs), deterministic placement/sizing/delay so
// server and client render identically — same "no Math.random" rule as
// CandlestickGlow. Absolutely positioned, pointer-events-none, meant to sit
// behind page content inside a `relative` ancestor.

const ORBS = [
  { top: "4%", left: "8%", size: 180, delay: "0s", duration: "24s", hue: "blocked" },
  { top: "18%", left: "72%", size: 140, delay: "-6s", duration: "20s", hue: "secondary" },
  { top: "58%", left: "4%", size: 120, delay: "-12s", duration: "26s", hue: "blocked" },
  { top: "68%", left: "82%", size: 200, delay: "-3s", duration: "22s", hue: "secondary" },
  { top: "38%", left: "46%", size: 90, delay: "-9s", duration: "18s", hue: "blocked" },
] as const;

const HUE_CLASS: Record<string, string> = {
  blocked: "bg-blocked",
  secondary: "bg-secondary",
};

export default function PurpleOrbs({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className={`absolute animate-orb-float rounded-full blur-2xl ${HUE_CLASS[orb.hue]}`}
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
