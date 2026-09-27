import { createClient } from "@/lib/supabase/server";
import { getTradingDateET } from "@/lib/data/dailyLossLock";

// Real, coded enforcement for what the Playbook's "Two-Loss Morning
// Lockout" rule used to describe as a self-enforced, honor-system-only
// rule (see app/playbook/exits/page.tsx). This is the same trading-day
// concept as the dollar-based Daily Loss Limit (dailyLossLock.ts), but
// counts STOP-OUTS -- individual trades that hit close to their full
// planned risk -- rather than summing net P/L, so two bad trades lock the
// terminal even on a day the dollar limit hasn't been reached yet.
//
// There's no dedicated "hit my stop" flag anywhere in xrill_outcomes (see
// app/journal/actions.ts's saveTradeOutcome -- it only ever records the
// realized profit_loss), so a stop-out is derived from data that already
// exists: a trade counts if its journaled loss reached at least 90% of
// that trade's own planned risk (xrill_sessions.trade_risk, set at
// submission time by evaluateTradePlan). 90% rather than 100% because a
// real fill on a hard stop rarely lands on the exact planned price.
const STOP_OUT_FRACTION = 0.9;
export const TWO_LOSS_THRESHOLD = 2;

export interface TwoLossStatus {
  locked: boolean;
  stopOutCount: number;
  threshold: number;
  tradingDate: string;
}

export async function getTwoLossStatus(userId: string): Promise<TwoLossStatus> {
  const supabase = createClient();
  const tradingDate = getTradingDateET();

  // Two queries rather than one embedded-join query (unlike
  // getDailyLossStatus's sum, this needs to read trade_risk back out per
  // row, and Supabase's embedded-resource shape for that isn't worth
  // guessing at) -- today's authorized sessions, then the outcomes
  // journaled against them.
  const { data: todaysSessions } = await supabase
    .from("xrill_sessions")
    .select("id, trade_risk")
    .eq("user_id", userId)
    .eq("session_date", tradingDate);

  const sessionIds = (todaysSessions ?? []).map((s) => s.id);
  const riskBySessionId = new Map((todaysSessions ?? []).map((s) => [s.id, s.trade_risk ?? 0]));

  if (sessionIds.length === 0) {
    return { locked: false, stopOutCount: 0, threshold: TWO_LOSS_THRESHOLD, tradingDate };
  }

  const { data: outcomes } = await supabase
    .from("xrill_outcomes")
    .select("session_id, profit_loss")
    .eq("user_id", userId)
    .in("session_id", sessionIds);

  const stopOutCount = (outcomes ?? []).filter((o) => {
    const tradeRisk = riskBySessionId.get(o.session_id) ?? 0;
    if (tradeRisk <= 0) return false;
    return (o.profit_loss ?? 0) <= -STOP_OUT_FRACTION * tradeRisk;
  }).length;

  return {
    locked: stopOutCount >= TWO_LOSS_THRESHOLD,
    stopOutCount,
    threshold: TWO_LOSS_THRESHOLD,
    tradingDate,
  };
}
