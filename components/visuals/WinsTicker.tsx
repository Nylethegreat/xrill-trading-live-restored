import { createClient } from "@/lib/supabase/server";
import { AUDIT_WINS } from "@/lib/data/auditWins";
import WinsTickerScroller, { type TickerRow } from "./WinsTickerScroller";

interface DbWinRow {
  id: string;
  ticker: string;
  direction: "long" | "short";
  closed_at: string | null;
  created_at: string;
  return_pct: number | null;
}

const ROW_HEIGHT_PX = 34; // must match the row's actual rendered height (px-3 py-2, text-xs, single line)

// Purely decorative background element for the hero — NOT the site's full
// disclosed track record (that's PublicTradeLedger further down the page,
// wins and losses both, with the CFTC 4.41 disclaimer). This only ever
// shows winners and deliberately omits every dollar figure.
//
// Content source, in priority order:
//   1. Real closed wins from trade_alerts, once there are enough of them
//      (>=4) to make a real scroll rather than a repeating handful.
//   2. Until then, the disclosed 2026 audit's "Winner's Circle" list
//      (lib/data/auditWins.ts) — real, disclosed numbers, transcribed
//      verbatim from the PDF, not invented. Swap out once (1) has enough
//      rows to stand on its own.
export default async function WinsTicker({ className = "" }: { className?: string }) {
  const supabase = createClient();

  const { data: dbRows } = await supabase
    .from("trade_alerts")
    .select("id, ticker, direction, created_at, closed_at, return_pct")
    .eq("status", "closed")
    .gt("return_pct", 0)
    .order("closed_at", { ascending: false })
    .limit(50);

  const liveWins = (dbRows ?? []) as DbWinRow[];

  const rows: TickerRow[] =
    liveWins.length >= 4
      ? liveWins.map((w) => ({
          key: w.id,
          date: new Date(w.closed_at ?? w.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          ticker: w.ticker,
          setup: w.direction === "long" ? "LONG" : "SHORT",
          gainPct: w.return_pct ?? 0,
        }))
      : AUDIT_WINS.map((w, i) => ({
          key: `audit-${i}`,
          date: w.date.replace(", 2026", ""), // keep rows compact; year is redundant repeated 40+ times
          ticker: w.ticker,
          setup: w.setup,
          gainPct: w.gainPct,
        }));

  if (rows.length === 0) return null;

  // Duplicated end-to-end so the scroller's scrollTop wrap-around loops
  // seamlessly (see WinsTickerScroller) — same technique as EkgPulse's
  // -50% transform loop, just driven by real scroll instead of a transform.
  const loop = [...rows, ...rows];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <WinsTickerScroller rows={loop} singleSetHeight={rows.length * ROW_HEIGHT_PX} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
