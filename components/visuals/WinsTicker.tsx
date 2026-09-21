import { createClient } from "@/lib/supabase/server";

interface WinRow {
  id: string;
  ticker: string;
  direction: "long" | "short";
  closed_at: string | null;
  created_at: string;
  return_pct: number | null;
}

// Purely decorative background element for the hero — NOT a performance
// claim or the site's actual disclosed track record (that's
// PublicTradeLedger further down the page, wins and losses both, with the
// CFTC 4.41 disclaimer). This only ever shows winners and deliberately
// omits every dollar figure, so it reads as ambient texture rather than a
// marketing statistic. Same anon-readable "status = closed" RLS policy as
// PublicTradeLedger — no new data exposure.
export default async function WinsTicker({ className = "" }: { className?: string }) {
  const supabase = createClient();

  const { data: rows } = await supabase
    .from("trade_alerts")
    .select("id, ticker, direction, created_at, closed_at, return_pct")
    .eq("status", "closed")
    .gt("return_pct", 0)
    .order("closed_at", { ascending: false })
    .limit(14);

  const wins = (rows ?? []) as WinRow[];
  if (wins.length < 4) return null; // not enough real data yet — don't fake a scroll

  const dateLabel = (w: WinRow) =>
    new Date(w.closed_at ?? w.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  // Duplicated end-to-end so a -50% translateY loops seamlessly, same
  // technique as EkgPulse's -50% translateX scroll.
  const loop = [...wins, ...wins];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative overflow-hidden font-mono text-xs ${className}`}
    >
      <div className="motion-safe:animate-wins-scroll-y motion-reduce:hidden">
        {loop.map((w, i) => (
          <div key={`${w.id}-${i}`} className="flex items-center justify-between gap-4 whitespace-nowrap px-3 py-2 opacity-70">
            <span className="text-white/30">{dateLabel(w)}</span>
            <span className="font-semibold text-white/50">
              {w.ticker} <span className="text-white/25">{w.direction === "long" ? "LONG" : "SHORT"}</span>
            </span>
            <span className="text-accent/70">+{w.return_pct}%</span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
