// Purely presentational progress indicator for the Daily Check-In step --
// reads how many of the 4 questions are answered and renders it as a
// magnetic-torpedo-level style gauge (matching the spirit-level bubbles
// added to the homepage's GatePipeline). Never touches scoring/
// authorization logic -- it's fed a count, not the answers themselves.
export default function TorpedoGauge({ answered, total }: { answered: number; total: number }) {
  const pct = total > 0 ? (answered / total) * 100 : 0;
  const full = answered >= total;

  return (
    <div className="mt-4">
      <div
        className={`relative h-8 w-full overflow-hidden rounded-full border-2 bg-black/50 transition-colors ${
          full ? "border-accent shadow-[0_0_14px_rgba(34,197,94,0.6)]" : "border-white/20"
        }`}
      >
        {/* fill */}
        <div
          className="h-full bg-gradient-to-r from-accent/40 via-accent/70 to-accent transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
        {/* the "bubble" -- drifts to center and glows once full, like a
            level snapping to plumb */}
        <div
          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 transition-all duration-500 ease-out ${
            full
              ? "left-1/2 -translate-x-1/2 border-white bg-accent shadow-[0_0_10px_rgba(34,197,94,0.9)] motion-safe:animate-candle-pulse"
              : "border-white/50 bg-white/20"
          }`}
          style={full ? undefined : { left: `${Math.max(6, pct)}%`, transform: "translate(-50%, -50%)" }}
        />
        {/* segment ticks so it visibly reads as 4 steps, not a smooth bar */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.4) 0, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 25%)",
          }}
        />
      </div>
      <p className={`mt-1 text-center text-[11px] font-mono ${full ? "text-accent" : "text-white/40"}`}>
        {full ? "⚡ LEVEL — cleared for Gate 2" : `${answered}/${total} answered`}
      </p>
    </div>
  );
}
