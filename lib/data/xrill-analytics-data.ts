import { createClient } from "@/lib/supabase/server";
import type { SessionOutcomeRow } from "@/lib/analytics";

// Joins xrill_sessions with its (at most one) xrill_outcomes row for the
// signed-in user, and flattens them into the shape lib/analytics.ts expects
// — the TS equivalent of the Python system's flat 37-field dataset, which
// there came from a single SQLite table rather than a join.
export async function getSessionOutcomeRows(userId: string): Promise<SessionOutcomeRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("xrill_sessions")
    .select(
      `id, created_at, session_date, market_session, setup_type, time_of_day,
       ticker, direction, entry, stop, target, contracts, point_value,
       risk_points, reward_points, trade_risk, trade_reward, rr, max_risk,
       daily_score, trade_gate_score, setup_score, risk_approved,
       execution_score, trade_score, trade_authorized, rejection_reason,
       xrill_outcomes ( profit_loss, followed_plan, followed_exit_rules,
         emotion, lesson, exit_price, holding_minutes, risk_multiple,
         max_favorable_excursion, max_adverse_excursion )`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row): SessionOutcomeRow => {
    // Supabase types this as an array (one-to-many FK), but the app only
    // ever writes at most one outcome per session.
    const outcome = Array.isArray(row.xrill_outcomes) ? row.xrill_outcomes[0] : row.xrill_outcomes;

    return {
      session_id: row.id,
      created_at: row.created_at,
      session_date: row.session_date,
      market_session: row.market_session,
      setup_type: row.setup_type,
      time_of_day: row.time_of_day,
      ticker: row.ticker,
      direction: row.direction,
      entry: row.entry,
      stop: row.stop,
      target: row.target,
      contracts: row.contracts,
      point_value: row.point_value,
      risk_points: row.risk_points,
      reward_points: row.reward_points,
      trade_risk: row.trade_risk,
      trade_reward: row.trade_reward,
      rr: row.rr,
      max_risk: row.max_risk,
      daily_score: row.daily_score,
      trade_gate_score: row.trade_gate_score,
      setup_score: row.setup_score,
      risk_approved: row.risk_approved,
      execution_score: row.execution_score,
      trade_score: row.trade_score,
      trade_authorized: row.trade_authorized,
      rejection_reason: row.rejection_reason,
      profit_loss: outcome?.profit_loss ?? null,
      followed_plan: outcome?.followed_plan ?? null,
      followed_exit_rules: outcome?.followed_exit_rules ?? null,
      emotion: outcome?.emotion ?? null,
      lesson: outcome?.lesson ?? null,
      exit_price: outcome?.exit_price ?? null,
      holding_minutes: outcome?.holding_minutes ?? null,
      risk_multiple: outcome?.risk_multiple ?? null,
      mfe: outcome?.max_favorable_excursion ?? null,
      mae: outcome?.max_adverse_excursion ?? null,
    };
  });
}
