import { createClient } from "@/lib/supabase/server";
import { effectiveDailyLossLimit } from "@/lib/riskProfile";

// The "trading day" for every daily-loss-limit calculation, and for new
// xrill_sessions.session_date going forward, is the US Eastern calendar
// day -- not server UTC, which used to roll the date over at 8pm ET mid
// trading-day. Intl with timeZone: "America/New_York" and the en-CA
// locale conveniently formats straight to YYYY-MM-DD.
const ET_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getTradingDateET(date: Date = new Date()): string {
  return ET_FORMATTER.format(date);
}

export interface DailyLossStatus {
  locked: boolean;
  limit: number;
  netPnl: number; // today's net realized P/L; negative = a loss so far
  tradingDate: string; // YYYY-MM-DD, Eastern
}

// Sums today's *journaled* outcomes only (lib/data/journalCodex.ts-style --
// see app/journal/actions.ts's saveTradeOutcome, the only writer to
// xrill_outcomes). There's no live/unrealized P/L tracked anywhere in
// XRILL, so "today's loss" can only ever mean "what you've logged so
// far" -- it will not reflect an open position you haven't journaled yet.
// "Today" is matched against xrill_sessions.session_date (Eastern,
// see getTradingDateET) rather than xrill_outcomes.created_at, so a
// session started before midnight ET and journaled just after still
// counts against the day it was actually traded.
export async function getDailyLossStatus(userId: string): Promise<DailyLossStatus> {
  const supabase = createClient();
  const tradingDate = getTradingDateET();

  const [{ data: account }, { data: outcomes }, { data: trims }] = await Promise.all([
    supabase.from("accounts").select("balance, risk_percent, stop_loss_percent, daily_loss_limit").eq("user_id", userId).maybeSingle(),
    supabase
      .from("xrill_outcomes")
      .select("session_id, profit_loss, xrill_sessions!inner(session_date)")
      .eq("user_id", userId)
      .eq("xrill_sessions.session_date", tradingDate),
    supabase
      .from("xrill_trims")
      .select("session_id, profit_loss, xrill_sessions!inner(session_date)")
      .eq("user_id", userId)
      .eq("xrill_sessions.session_date", tradingDate),
  ]);

  // Enforce the bound limit, not the raw stored one: a stale row (saved
  // before the hierarchy rules, or left behind by a balance change) can
  // never lock the day below 1.5x one Max Trade Loss.
  const limit = account ? effectiveDailyLossLimit(account) : 1000;

  // A closed trade's outcome already includes its trims (saveTradeOutcome
  // stores the trade's total P/L), so trims only count separately while
  // their trade is still open -- realized the moment you trim, never twice.
  const closedIds = new Set((outcomes ?? []).map((o) => o.session_id));
  const closedPnl = (outcomes ?? []).reduce((sum, row) => sum + Number(row.profit_loss ?? 0), 0);
  const openTrimPnl = (trims ?? [])
    .filter((t) => !closedIds.has(t.session_id))
    .reduce((sum, t) => sum + Number(t.profit_loss ?? 0), 0);
  const netPnl = closedPnl + openTrimPnl;

  return {
    locked: limit > 0 && netPnl <= -limit,
    limit,
    netPnl,
    tradingDate,
  };
}
