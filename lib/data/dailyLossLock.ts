import { createClient } from "@/lib/supabase/server";

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

  const [{ data: account }, { data: outcomes }] = await Promise.all([
    supabase.from("accounts").select("daily_loss_limit").eq("user_id", userId).maybeSingle(),
    supabase
      .from("xrill_outcomes")
      .select("profit_loss, xrill_sessions!inner(session_date)")
      .eq("user_id", userId)
      .eq("xrill_sessions.session_date", tradingDate),
  ]);

  const limit = account?.daily_loss_limit ?? 1000;
  const netPnl = (outcomes ?? []).reduce((sum, row) => sum + (row.profit_loss ?? 0), 0);

  return {
    locked: limit > 0 && netPnl <= -limit,
    limit,
    netPnl,
    tradingDate,
  };
}
