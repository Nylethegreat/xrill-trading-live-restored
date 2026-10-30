// Daily Trade Cap -- client-safe constants and helpers. The server-side
// status lives in lib/data/tradeCap.ts; the "raises wait until tomorrow"
// rule is enforced by the guard_trade_cap trigger on public.accounts.

export const DEFAULT_MAX_TRADES = 3;
export const MIN_MAX_TRADES = 1;
export const MAX_MAX_TRADES = 10;

export interface TradeCapAccount {
  max_trades_per_day?: number | null;
  pending_max_trades?: number | null;
  pending_max_trades_from?: string | null;
}

// The cap that applies today: a pending raise counts once its day arrives,
// even before any write promotes it in the row.
export function effectiveTradeCap(a: TradeCapAccount | null | undefined, today: string): number {
  if (!a) return DEFAULT_MAX_TRADES;
  if (a.pending_max_trades && a.pending_max_trades_from && a.pending_max_trades_from <= today) {
    return a.pending_max_trades;
  }
  return a.max_trades_per_day ?? DEFAULT_MAX_TRADES;
}

// Any session that put real money on: authorized by the engine, or
// logged after the fact (the engine was skipped). Blocked sessions are
// the engine doing its job and never count.
export function countsAsTrade(s: { trade_authorized?: boolean | null; logged_after?: boolean | null }) {
  return !!s.trade_authorized || !!s.logged_after;
}
