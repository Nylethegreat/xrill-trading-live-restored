// Decorative EKG/heartbeat line — deliberately the ONLY decorative red
// element on the site (red elsewhere, e.g. the "loss" token, is functional:
// short badges, negative returns). Used once, next to the Public Trade
// Ledger heading, to read as "this feed is alive."
export default function EkgPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-6 w-24 overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 600 60"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-[200%] motion-safe:animate-ekg-scroll motion-reduce:animate-none"
      >
        <polyline
          points="0,30 40,30 55,30 65,10 75,50 85,15 95,30 150,30 165,30 175,18 185,42 195,30 300,30
                  300,30 340,30 355,30 365,10 375,50 385,15 395,30 450,30 465,30 475,18 485,42 495,30 600,30"
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]"
        />
      </svg>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-surface to-transparent" />
    </div>
  );
}

// Small "LIVE" pulsing dot, reusable anywhere a live-data feed should read
// as alive (ledger heading, realtime alert feed, etc).
export function LiveDot({ tone = "loss" }: { tone?: "loss" | "accent" }) {
  const color = tone === "loss" ? "bg-loss" : "bg-accent";
  return (
    <span className="relative flex h-2 w-2" aria-hidden="true">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75 motion-reduce:animate-none`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}
