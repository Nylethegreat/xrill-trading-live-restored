import Link from "next/link";
import type { OpenPosition } from "@/lib/data/openPositions";

// Shown for each real open position -- an authorized session with no
// xrill_outcomes row yet (computed in lib/data/openPositions.ts, the
// single source of truth for what counts as "open," shared with the
// concurrent-trade gate in app/session/actions.ts). Nothing here is
// inferred beyond that; the Close button just routes to the Journal,
// where saveTradeOutcome (the system's one real write path for closing a
// trade) already lives.
export default function OpenPositionCard({ session }: { session: OpenPosition }) {
  const opened = new Date(session.created_at);
  const openedLabel = opened.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="rounded border border-primary/30 bg-primary/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Open Position
            {session.engine === "daytrade" && <span className="text-daytrade">⚡</span>}
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

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Premium Paid</p>
          <p className="mt-0.5 font-mono text-sm text-white">
            {session.entry !== null ? `$${session.entry.toFixed(2)}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Stop-Loss</p>
          <p className="mt-0.5 font-mono text-sm text-loss">
            {session.stop !== null ? `$${session.stop.toFixed(2)}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Take-Profit</p>
          <p className="mt-0.5 font-mono text-sm text-accent">
            {session.target !== null ? `$${session.target.toFixed(2)}` : "—"}
          </p>
        </div>
      </div>

      {session.trade_risk !== null && (
        <p className="mt-2 text-center text-[11px] text-white/40">
          ${session.trade_risk.toFixed(2)} at risk on this position
        </p>
      )}
    </div>
  );
}
