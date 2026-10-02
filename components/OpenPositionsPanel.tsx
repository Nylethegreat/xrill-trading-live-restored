import OpenPositionCard from "@/components/OpenPositionCard";
import type { OpenPosition } from "@/lib/data/openPositions";

// Multi-position replacement for the old single-card "Open Position"
// section -- the dashboard used to derive just the single most-recent
// unjournaled session (allSessions.find(...)), which silently hid every
// other simultaneously open trade. Now renders all of them, plus the
// cumulative dollar risk across every open position compared against the
// account's Daily Loss Limit, so "how exposed am I right now, total" is
// visible at a glance instead of trade-by-trade.
export default function OpenPositionsPanel({
  positions,
  totalRisk,
  limit,
  dailyLossLimit,
}: {
  positions: OpenPosition[];
  totalRisk: number;
  limit: number;
  dailyLossLimit: number;
}) {
  if (positions.length === 0) return null;

  const exposurePercent = dailyLossLimit > 0 ? Math.min(100, (totalRisk / dailyLossLimit) * 100) : 0;
  const barTone = exposurePercent >= 100 ? "bg-loss" : exposurePercent >= 60 ? "bg-caution" : "bg-accent";

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Open Positions ({positions.length}/{limit})
        </p>
        {positions.length > 2 && (
          <span className="text-[11px] text-caution">⚠️ {positions.length} open: XRILL recommends no more than 2</span>
        )}
      </div>

      <div className="rounded border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50">Total Open Exposure</span>
          <span className={`font-mono ${exposurePercent >= 100 ? "text-loss" : exposurePercent >= 60 ? "text-caution" : "text-white/70"}`}>
            ${totalRisk.toFixed(2)} / ${dailyLossLimit.toFixed(2)} DLL
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full ${barTone} transition-all`} style={{ width: `${exposurePercent}%` }} />
        </div>
        {exposurePercent >= 100 && (
          <p className="mt-1.5 text-[11px] text-loss">
            ⚠️ Combined risk across open positions has reached your Daily Loss Limit — if every stop hits today, you're at the cap.
          </p>
        )}
      </div>

      <div className={`grid gap-3 ${positions.length > 2 ? "lg:grid-cols-3 sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        {positions.map((p) => (
          <OpenPositionCard key={p.id} session={p} />
        ))}
      </div>
    </div>
  );
}
