import Link from "next/link";

interface OpenSession {
  id: number;
  ticker: string | null;
  direction: string | null;
  trade_score: number | null;
  created_at: string;
}

// Shown only when a real open position exists -- the most recent
// authorized session with no xrill_outcomes row yet (computed in
// app/dashboard/page.tsx). Nothing here is inferred beyond that; the
// Close button just routes to the Journal, where saveTradeOutcome (the
// system's one real write path for closing a trade) already lives.
export default function OpenPositionCard({ session }: { session: OpenSession }) {
  const opened = new Date(session.created_at);
  const openedLabel = opened.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="mt-3 rounded border border-primary/30 bg-primary/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Open Position
          </p>
          <p className="mt-1 font-mono text-sm text-white">
            {session.ticker ?? "—"} <span className="text-white/50">{session.direction ?? ""}</span>
          </p>
          <p className="mt-0.5 text-xs text-white/40">
            Opened {openedLabel} · XRILL Score {session.trade_score ?? "—"}/100
          </p>
        </div>
        <Link
          href="/journal"
          className="flex-none rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_14px_3px_rgba(59,130,246,0.5)] hover:bg-blue-400"
        >
          Close
        </Link>
      </div>
    </div>
  );
}
