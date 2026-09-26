// A live progress bar toward the account's daily loss limit -- makes the
// number on Account Settings (previously totally inert) something you can
// actually see moving, and doubles as the plain-language explanation for
// why /session might lock you out. Server component: pure props in,
// static markup out, no client state needed.
export default function DailyLossMeter({ netPnl, limit }: { netPnl: number; limit: number }) {
  const loss = Math.max(0, -netPnl);
  const pct = limit > 0 ? Math.min(100, (loss / limit) * 100) : 0;
  const isProfit = netPnl > 0;
  const barColor = pct >= 100 ? "bg-loss" : pct >= 70 ? "bg-caution" : "bg-accent";

  return (
    <div className="rounded border border-white/10 bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Today's Loss Limit</h3>
        <span className={isProfit ? "text-accent" : "text-white/70"}>
          {isProfit ? "+" : "-"}${Math.abs(netPnl).toLocaleString()}{" "}
          <span className="text-white/40">of ${limit.toLocaleString()}</span>
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/40">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-white/40">
        {pct >= 100
          ? "Limit hit — the terminal is locked for the rest of today."
          : isProfit
            ? "Net positive today — the limit only tracks losses."
            : "Counts journaled Session outcomes only, on the Eastern trading day."}
      </p>
    </div>
  );
}
