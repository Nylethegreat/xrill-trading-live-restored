import Link from "next/link";
import type { OpenPosition } from "@/lib/data/openPositions";
import { structureLabel } from "@/lib/structures";

// Shown for each real open position -- an authorized session with no
// xrill_outcomes row yet (computed in lib/data/openPositions.ts, the
// single source of truth for what counts as "open," shared with the
// concurrent-trade gate in app/session/actions.ts). Nothing here is
// inferred beyond that; the Close button just routes to the Journal,
// where saveTradeOutcome (the system's one real write path for closing a
// trade) already lives.
//
// Header reads like a broker ticket -- "2x SPY $565 C" -- with the size,
// strike and expiry up front, and the risk math spelled out underneath so
// nobody has to reverse-engineer where the dollar figure came from.

const money = (v: number) => `$${v.toFixed(2)}`;

// "$565" for whole strikes, "$565.5" otherwise.
const strikeLabel = (v: number) => `$${Number.isInteger(v) ? v.toFixed(0) : String(+v.toFixed(2))}`;

// Days to expiration, counted in US Eastern calendar days (the market's
// clock), so a Friday expiry reads "0 DTE" all day Friday.
function daysToExpiry(expiration: string): number {
  const todayET = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const ms = Date.parse(`${expiration}T00:00:00Z`) - Date.parse(`${todayET}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

function expiryLabel(expiration: string) {
  const d = new Date(`${expiration}T12:00:00Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function OpenPositionCard({ session }: { session: OpenPosition }) {
  const opened = new Date(session.created_at);
  const openedLabel = opened.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const openedContracts = session.contracts && session.contracts > 0 ? session.contracts : null;
  // After trims, size and risk reflect only what's still open.
  const contracts = session.remainingContracts !== null && session.remainingContracts > 0 ? session.remainingContracts : openedContracts;
  const spread = structureLabel(session.structure, session.legs);
  const side = session.direction === "PUT" ? "P" : session.direction === "CALL" ? "C" : null;
  const dte = session.expiration ? daysToExpiry(session.expiration) : null;
  const perContractRisk = session.trade_risk !== null && openedContracts ? session.trade_risk / openedContracts : null;
  const openRisk = session.remainingRisk ?? session.trade_risk;

  const dteTone =
    dte === null ? "" : dte < 0 ? "border-loss/50 bg-loss/15 text-loss" : dte <= 1 ? "border-caution/50 bg-caution/15 text-caution" : "border-white/20 bg-white/5 text-white/70";

  return (
    <div className={`rounded border p-4 ${session.logged_after ? "border-loss/50 bg-loss/10" : "border-primary/30 bg-primary/10"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <span className="whitespace-nowrap">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
              Open Position
            </span>
            {session.engine === "daytrade" && <span className="text-daytrade">⚡</span>}
            {session.logged_after && (
              <span className="whitespace-nowrap rounded-full border border-loss/60 bg-loss/20 px-1.5 py-0.5 text-[10px] font-bold text-loss">🚨 LOGGED AFTER</span>
            )}
          </p>

          {/* Ticket-style header: size, ticker, strike/structure, side */}
          <p className="mt-1.5 font-mono text-lg font-bold leading-tight text-white">
            {contracts && <span className="text-primary">{contracts}x </span>}
            {session.ticker ?? "—"}
            {spread ? (
              <span className="text-white/90"> {spread}</span>
            ) : (
              <>
                {session.strike !== null && <span> {strikeLabel(session.strike)}</span>}
                {side ? (
                  <span className={side === "C" ? " text-accent" : " text-loss"}> {session.strike !== null ? side : session.direction}</span>
                ) : null}
              </>
            )}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {contracts && (
              <span className="rounded-full border border-primary/50 bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-blue-200">
                Size: {contracts} {spread ? (contracts === 1 ? "Spread" : "Spreads") : contracts === 1 ? "Contract" : "Contracts"}
                {session.trimmedContracts > 0 && openedContracts ? ` (of ${openedContracts})` : ""}
              </span>
            )}
            {session.trimmedContracts > 0 && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  session.trimProfitLoss >= 0 ? "border-accent/50 bg-accent/10 text-accent" : "border-loss/50 bg-loss/10 text-loss"
                }`}
              >
                ✂️ {session.trimmedContracts} trimmed · {session.trimProfitLoss >= 0 ? "+" : "-"}${Math.abs(session.trimProfitLoss).toFixed(2)}
              </span>
            )}
            {session.expiration && dte !== null && (
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${dteTone}`}>
                Exp {expiryLabel(session.expiration)} · {dte < 0 ? "Expired" : `${dte} DTE`}
              </span>
            )}
            {session.strike === null && !session.expiration && (
              <span className="text-[11px] text-white/35">Add strike &amp; expiry in the Trade Plan to show them here</span>
            )}
          </div>

          <p className="mt-1.5 text-xs text-white/40">
            Opened {openedLabel} · XRILL Score {session.trade_score ?? "—"}/100
          </p>
        </div>
        <Link
          href={`/journal#session-${session.id}`}
          className="flex-none rounded bg-blue-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-[0_0_14px_3px_rgba(59,130,246,0.5)] hover:bg-blue-400"
        >
          Close / Trim
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">{spread ? "Net Debit" : "Premium Paid"}</p>
          <p className="mt-0.5 font-mono text-sm text-white">{session.entry !== null ? money(session.entry) : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Stop-Loss</p>
          <p className="mt-0.5 font-mono text-sm text-loss">{session.stop !== null ? money(session.stop) : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Take-Profit</p>
          <p className="mt-0.5 font-mono text-sm text-accent">{session.target !== null ? money(session.target) : "—"}</p>
        </div>
      </div>

      {openRisk !== null && (
        <div className="mt-3 rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
          <p className="font-mono text-sm text-white">
            {session.trimmedContracts > 0 ? "Open Risk" : "Total Risk"}: <span className="font-bold text-loss">{money(openRisk)}</span>
          </p>
          {perContractRisk !== null && contracts && (
            <p className="mt-0.5 font-mono text-[11px] text-white/50">
              ({money(perContractRisk)}/{spread ? "spread" : "contract"} × {contracts} {spread ? (contracts === 1 ? "spread" : "spreads") : contracts === 1 ? "contract" : "contracts"}
              {session.trimmedContracts > 0 ? " still open" : ""})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
