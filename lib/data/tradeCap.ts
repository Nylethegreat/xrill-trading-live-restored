import { createClient } from "@/lib/supabase/server";
import { getTradingDateET } from "@/lib/data/dailyLossLock";
import { countsAsTrade, effectiveTradeCap } from "@/lib/tradeCap";
import { isZeroDte } from "@/lib/zeroDte";

// Daily Trade Cap status for today (Eastern trading day), checked by both
// engines' submit actions and shown on the dashboard. Also counts today's
// skipped-engine trades and same-day (0DTE) trades, since those come from
// the same rows.
export interface TradeCapStatus {
  locked: boolean;
  cap: number;
  taken: number; // authorized + logged-after today
  skippedEngine: number; // logged-after today
  zeroDteAuthorized: number; // authorized today with a same-day expiration
  pendingCap: number | null;
  pendingFrom: string | null;
  tradingDate: string;
}

export async function getTradeCapStatus(userId: string): Promise<TradeCapStatus> {
  const supabase = createClient();
  const tradingDate = getTradingDateET();

  const [{ data: account }, { data: sessions }] = await Promise.all([
    supabase
      .from("accounts")
      .select("max_trades_per_day, pending_max_trades, pending_max_trades_from")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("xrill_sessions")
      .select("trade_authorized, logged_after, expiration")
      .eq("user_id", userId)
      .eq("session_date", tradingDate),
  ]);

  const cap = effectiveTradeCap(account, tradingDate);
  const rows = sessions ?? [];
  const taken = rows.filter(countsAsTrade).length;
  const pendingActive = !!account?.pending_max_trades && !!account.pending_max_trades_from && account.pending_max_trades_from > tradingDate;

  return {
    locked: taken >= cap,
    cap,
    taken,
    skippedEngine: rows.filter((s) => s.logged_after).length,
    zeroDteAuthorized: rows.filter((s) => s.trade_authorized && isZeroDte(s.expiration, tradingDate)).length,
    pendingCap: pendingActive ? account!.pending_max_trades! : null,
    pendingFrom: pendingActive ? account!.pending_max_trades_from! : null,
    tradingDate,
  };
}
