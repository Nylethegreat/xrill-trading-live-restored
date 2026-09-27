// The "big chain bar" -- a live indicator for the Two-Loss Lockout
// (lib/data/twoLossLock.ts), sitting next to DailyLossMeter so both real
// lockout triggers are visible in one place instead of only being
// discovered by hitting them on /session. Each link fills in as a
// stop-out is journaled; the padlock flips once the threshold hits.
// Server component: pure props in, static markup out.
export default function TwoLossLockMeter({
  stopOutCount,
  threshold,
}: {
  stopOutCount: number;
  threshold: number;
}) {
  const locked = stopOutCount >= threshold;

  return (
    <div className="rounded border border-white/10 bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Two-Loss Lockout</h3>
        <span className={locked ? "text-loss" : "text-white/70"}>
          {stopOutCount}/{threshold} stop-outs today
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        {Array.from({ length: threshold }).map((_, i) => (
          <span
            key={i}
            className={`text-xl transition-opacity ${i < stopOutCount ? "opacity-100" : "opacity-20"}`}
            aria-hidden="true"
          >
            ⛓️
          </span>
        ))}
        <span className="ml-1 text-lg" aria-hidden="true">
          {locked ? "🔒" : "🔓"}
        </span>
        <span className="text-[11px] text-white/40">
          {locked ? "Locked for the rest of today" : "Unlocked"}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-white/40">
        {locked
          ? "Two stop-outs hit today — the terminal is locked for the rest of the session, same as the dollar loss limit."
          : stopOutCount === threshold - 1
            ? "Heads up — one more trade that hits its stop locks the terminal for the rest of today."
            : "Two journaled stop-losses in one trading day lock Start Session until tomorrow, regardless of the dollar limit above."}
      </p>
    </div>
  );
}
