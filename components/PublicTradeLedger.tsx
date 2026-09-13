import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/Badge";
import EkgPulse, { LiveDot } from "@/components/visuals/EkgPulse";

interface ClosedAlertRow {
  id: string;
  closed_at: string | null;
  created_at: string;
  ticker: string;
  direction: "long" | "short";
  entry_price: number;
  exit_price: number | null;
  return_pct: number | null;
  gates_passed: number | null;
}

export default async function PublicTradeLedger() {
  const supabase = createClient();

  // Anon-readable by design: a dedicated RLS policy exposes only
  // status = 'closed' rows to the public role. Active/pending alerts stay
  // members-only. See migration allow_public_read_closed_trade_alerts.
  const { data: rows } = await supabase
    .from("trade_alerts")
    .select("id, created_at, closed_at, ticker, direction, entry_price, exit_price, return_pct, gates_passed")
    .eq("status", "closed")
    .order("closed_at", { ascending: false })
    .limit(15);

  const alerts = (rows ?? []) as ClosedAlertRow[];

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <LiveDot />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-loss">Live Ledger</span>
        <EkgPulse />
      </div>

      {alerts.length === 0 ? (
        <p className="rounded border border-white/10 bg-surface p-4 text-sm text-white/40">
          No closed positions have been published yet — check back once the first alert closes.
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-white/10 bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Ticker</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Entry</th>
                <th className="px-4 py-2.5 font-medium">Exit</th>
                <th className="px-4 py-2.5 font-medium">Gates Passed</th>
                <th className="px-4 py-2.5 text-right font-medium">Net Return</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                const isLong = a.direction === "long";
                const dateLabel = new Date(a.closed_at ?? a.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
                const isWin = a.return_pct !== null ? a.return_pct >= 0 : null;
                const gates = a.gates_passed ?? 8;
                return (
                  <tr key={a.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2.5 text-white/50">{dateLabel}</td>
                    <td className="px-4 py-2.5 font-mono font-medium text-white">{a.ticker}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={isLong ? "good" : "loss"}>{isLong ? "LONG" : "SHORT"}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-white/70">${a.entry_price}</td>
                    <td className="px-4 py-2.5 text-white/70">{a.exit_price !== null ? `$${a.exit_price}` : "—"}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`font-mono text-xs ${gates === 8 ? "text-accent" : gates >= 6 ? "text-caution" : "text-loss"}`}
                      >
                        {gates}/8
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {a.return_pct !== null ? (
                        <Badge tone={isWin ? "good" : "loss"}>
                          {a.return_pct > 0 ? "+" : ""}
                          {a.return_pct}%
                        </Badge>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 rounded border border-caution/30 bg-caution/10 p-2.5 text-[11px] leading-relaxed text-white/60">
        Every closed alert we've ever published, unedited — wins and losses alike. Hypothetical/past performance
        never guarantees future results (CFTC Rule 4.41) — see the full{" "}
        <Link href="/disclaimer" className="underline hover:text-white">
          Disclaimer
        </Link>
        .
      </p>
    </div>
  );
}
