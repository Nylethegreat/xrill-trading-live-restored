import { createClient } from "@/lib/supabase/server";

// Single source of truth for "what counts as an open position" -- reused
// by both the dashboard (to render them) and the session server actions
// (to gate new submissions against the concurrent-trade cap below). An
// open position is a trade_authorized session with no matching
// xrill_outcomes row yet -- same derivation the dashboard always used,
// just no longer capped to the single most-recent match via .find().
export const MAX_OPEN_POSITIONS = 2;

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
}

export interface OpenPositionsStatus {
  positions: OpenPosition[];
  count: number;
  totalRisk: number;
  atLimit: boolean;
  limit: number;
}

export async function getOpenPositionsStatus(userId: string): Promise<OpenPositionsStatus> {
  const supabase = createClient();

  const [{ data: sessions }, { data: outcomes }] = await Promise.all([
    supabase
      .from("xrill_sessions")
      .select("id, ticker, direction, trade_score, created_at, entry, stop, target, trade_risk, engine, trade_authorized")
      .eq("user_id", userId)
      .eq("trade_authorized", true)
      .order("created_at", { ascending: false }),
    supabase.from("xrill_outcomes").select("session_id").eq("user_id", userId),
  ]);

  const outcomeSessionIds = new Set((outcomes ?? []).map((o) => o.session_id));
  const positions: OpenPosition[] = (sessions ?? [])
    .filter((s) => !outcomeSessionIds.has(s.id))
    .map((s) => ({
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
    }));

  const totalRisk = positions.reduce((sum, p) => sum + (p.trade_risk ?? 0), 0);

  return {
    positions,
    count: positions.length,
    totalRisk,
    atLimit: positions.length >= MAX_OPEN_POSITIONS,
    limit: MAX_OPEN_POSITIONS,
  };
}
