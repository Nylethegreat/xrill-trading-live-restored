import { getSessionOutcomeRows } from "@/lib/data/xrill-analytics-data";
import WinsTickerScroller, { type TickerRow } from "@/components/visuals/WinsTickerScroller";

const ROW_HEIGHT_PX = 34;

// The same rolling-ticker treatment as the homepage's public audit
// ticker (WinsTicker.tsx), but personal: this user's own logged wins
// only, in real dollars (not %, since this is their own private data,
// not a public marketing claim) -- pulled from getSessionOutcomeRows,
// the same real data source the Journal and Analytics pages already use.
// Renders nothing until there are enough real wins to actually scroll.
export default async function MyWinsTicker({ userId, className = "" }: { userId: string; className?: string }) {
  const outcomes = await getSessionOutcomeRows(userId);
  const wins = outcomes
    .filter((o) => o.profit_loss !== null && o.profit_loss > 0)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (wins.length < 4) return null;

  const rows: TickerRow[] = wins.map((w) => ({
    key: String(w.session_id),
    date: new Date(w.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    ticker: w.ticker ?? "—",
    setup: w.direction ?? "",
    gainPct: w.profit_loss as number,
  }));

  const loop = [...rows, ...rows];

  return (
    <div className={`relative overflow-hidden rounded-lg border border-white/10 bg-surface ${className}`}>
      <p className="border-b border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
        Your Recent Wins
      </p>
      <div className="h-[calc(100%-1.75rem)]">
        <WinsTickerScroller rows={loop} singleSetHeight={rows.length * ROW_HEIGHT_PX} format="dollar" />
      </div>
    </div>
  );
}
