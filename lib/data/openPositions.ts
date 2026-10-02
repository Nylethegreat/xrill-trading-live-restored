import { createClient } from "@/lib/supabase/server";

// Single source of truth for "what counts as an open position" -- reused
// by both the dashboard (to render them) and the session server actions
// (to gate new submissions against the concurrent-trade cap below). An
// open position is a trade_authorized session with no matching
// xrill_outcomes row yet -- same derivation the dashboard always used,
// just no longer capped to the single most-recent match via .find().
// 3 hard max; XRILL recommends no more than 2 (shown in the UI). A
// multi-leg structure (spread, straddle) is ONE position.
export const MAX_OPEN_POSITIONS = 3;
export const RECOMMENDED_OPEN_POSITIONS = 2;

export interface OpenPosition {
  id: number;
  ticker: string | null;
  direction: string | null;
  trade_score: number | null;
  created_at: string;
  entry: number | null;
  stop: number | null;
  target: number | null;
  trade_risk: number | null;
  engine: string | null;
  contracts: number | null; // as opened
  strike: number | null;
  expiration: string | null; // YYYY-MM-DD
  structure: string | null;
  legs: unknown;
  logged_after: boolean;
  trimmedContracts: number; // closed early via trims
  remainingContracts: number | null;
  trimProfitLoss: number; // realized P/L from trims so far
  remainingRisk: number | null; // trade_risk scaled to the contracts still open
}

export interface OpenPositionsStatus {
  positions: OpenPosition[];
  count: number;
  totalRisk: number;
  atLimit: boolean;
  limit: number;
  recommended: number;
}

export async function getOpenPositionsStatus(userId: string): Promise<OpenPositionsStatus> {
  const supabase = createClient();

  const [{ data: sessions }, { data: outcomes }, { data: trims }] = await Promise.all([
    supabase
      .from("xrill_sessions")
      .select(
        "id, ticker, direction, trade_score, created_at, entry, stop, target, trade_risk, engine, trade_authorized, contracts, strike, expiration, structure, legs, logged_after"
      )
      .eq("user_id", userId)
      // Authorized trades, plus trades logged after the fact (emergency
      // log) -- those were really taken, so they're open until journaled.
      .or("trade_authorized.eq.true,logged_after.eq.true")
      .order("created_at", { ascending: false }),
    supabase.from("xrill_outcomes").select("session_id").eq("user_id", userId),
    supabase.from("xrill_trims").select("session_id, contracts, profit_loss").eq("user_id", userId),
  ]);

  const outcomeSessionIds = new Set((outcomes ?? []).map((o) => o.session_id));
  const trimsBySession = new Map<number, { contracts: number; pl: number }>();
  for (const t of trims ?? []) {
    const cur = trimsBySession.get(t.session_id) ?? { contracts: 0, pl: 0 };
    cur.contracts += t.contracts ?? 0;
    cur.pl += Number(t.profit_loss ?? 0);
    trimsBySession.set(t.session_id, cur);
  }

  const positions: OpenPosition[] = (sessions ?? [])
    .filter((s) => !outcomeSessionIds.has(s.id))
    .map((s) => {
      const trimmed = trimsBySession.get(s.id) ?? { contracts: 0, pl: 0 };
      const remaining = s.contracts ? Math.max(0, s.contracts - trimmed.contracts) : null;
      const remainingRisk =
        s.trade_risk !== null && s.contracts && remaining !== null ? (Number(s.trade_risk) / s.contracts) * remaining : s.trade_risk;
      return {
        id: s.id,
        ticker: s.ticker,
        direction: s.direction,
        trade_score: s.trade_score,
        created_at: s.created_at,
        entry: s.entry,
        stop: s.stop,
        target: s.target,
        trade_risk: s.trade_risk,
        engine: s.engine,
        contracts: s.contracts,
        strike: s.strike,
        expiration: s.expiration,
        structure: s.structure,
        legs: s.legs,
        logged_after: !!s.logged_after,
        trimmedContracts: trimmed.contracts,
        remainingContracts: remaining,
        trimProfitLoss: trimmed.pl,
        remainingRisk,
      };
    });

  // Exposure counts only what's still open: trimmed contracts no longer
  // carry risk.
  const totalRisk = positions.reduce((sum, p) => sum + (p.remainingRisk ?? 0), 0);

  return {
    positions,
    count: positions.length,
    totalRisk,
    atLimit: positions.length >= MAX_OPEN_POSITIONS,
    limit: MAX_OPEN_POSITIONS,
    recommended: RECOMMENDED_OPEN_POSITIONS,
  };
}
