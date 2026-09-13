import type { GroupStats } from "@/lib/analytics";

function money(v: number) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toLocaleString(undefined, { style: "currency", currency: "USD" })}`;
}

// A horizontal win-rate bar per group, sorted by session count. Bar color
// follows the status palette (win-rate quality), not the group's identity —
// there's no categorical dimension here worth a legend, the row label does
// that job.
export default function BreakdownTable({
  title,
  groups,
  order,
}: {
  title: string;
  groups: Record<string, GroupStats>;
  /** optional explicit row order (e.g. score buckets); otherwise sorted by session count */
  order?: string[];
}) {
  const keys = order ?? Object.keys(groups).sort((a, b) => groups[b].sessions - groups[a].sessions);
  const withData = keys.filter((k) => groups[k]);

  if (withData.length === 0) {
    return <p className="text-sm text-white/50">No data yet.</p>;
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h3>
      <div className="space-y-1.5">
        {withData.map((key) => {
          const g = groups[key];
          const barColor = g.completed === 0 ? "bg-white/20" : g.winRate >= 60 ? "bg-accent" : g.winRate >= 40 ? "bg-caution" : "bg-loss";
          return (
            <div key={key} className="flex items-center gap-3 rounded border border-white/10 bg-surface px-3 py-2 text-sm">
              <div className="w-24 shrink-0 truncate font-mono text-xs text-white/80">{key}</div>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, g.winRate))}%` }}
                  title={`${g.winRate.toFixed(1)}% win rate over ${g.completed} completed trade(s)`}
                />
              </div>
              <div className="w-12 shrink-0 text-right text-xs text-white/50">{g.sessions} ses</div>
              <div className={`w-20 shrink-0 text-right text-xs ${g.netPnl >= 0 ? "text-accent" : "text-loss"}`}>
                {money(g.netPnl)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
