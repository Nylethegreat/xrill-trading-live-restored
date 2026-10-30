import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SessionOutcomeRow } from "@/lib/analytics";
import { getSessionOutcomeRows } from "@/lib/data/xrill-analytics-data";
import { getTradingDateET } from "@/lib/data/dailyLossLock";
import { effectiveTradeCap } from "@/lib/tradeCap";
import { bestPastWeek, boardRow, rankBoard, weekStartET, type BoardRow, type WeekScore } from "@/lib/leaderboard";

// The Weekly Discipline Board. Other members' trades are private under
// RLS, so their rows are read here with the service-role client -- but
// only for members who opted in (profiles.show_on_leaderboard), only the
// handful of columns scoring needs, and only aggregate scores ever leave
// this server code. Nothing per-trade is rendered for anyone but the
// viewer.

const SCORING_COLUMNS = `user_id, created_at, session_date, trade_authorized, logged_after, trade_risk,
  xrill_outcomes ( created_at, profit_loss, exit_reason, thesis_result, confidence_post )`;

type RawRow = {
  user_id: string;
  created_at: string;
  session_date: string | null;
  trade_authorized: boolean | null;
  logged_after: boolean | null;
  trade_risk: number | null;
  xrill_outcomes: unknown;
};

function toScoringRow(r: RawRow): SessionOutcomeRow {
  const o = (Array.isArray(r.xrill_outcomes) ? r.xrill_outcomes[0] : r.xrill_outcomes) as
    | { created_at: string; profit_loss: number | null; exit_reason: string | null; thesis_result: string | null; confidence_post: number | null }
    | null
    | undefined;
  // Only the fields lib/leaderboard.ts and lib/disciplineStreaks.ts read.
  return {
    created_at: r.created_at,
    session_date: r.session_date,
    trade_authorized: r.trade_authorized,
    logged_after: !!r.logged_after,
    trade_risk: r.trade_risk,
    closed_at: o?.created_at ?? null,
    profit_loss: o?.profit_loss ?? null,
    exit_reason: o?.exit_reason ?? null,
    thesis_result: o?.thesis_result ?? null,
    confidence_post: o?.confidence_post ?? null,
  } as SessionOutcomeRow;
}

export interface LeaderboardData {
  weekStart: string;
  board: BoardRow[]; // opted-in members, plus the viewer even if not opted in
  viewerOptedIn: boolean;
  ghost: WeekScore | null; // the viewer's best completed week
}

export async function getLeaderboard(viewerId: string): Promise<LeaderboardData> {
  const supabase = createClient();
  const weekStart = weekStartET();
  const today = getTradingDateET();

  const [{ data: viewerProfile }, { data: viewerAccount }, viewerRows] = await Promise.all([
    supabase.from("profiles").select("display_name, show_on_leaderboard").eq("user_id", viewerId).maybeSingle(),
    supabase
      .from("accounts")
      .select("max_trades_per_day, pending_max_trades, pending_max_trades_from")
      .eq("user_id", viewerId)
      .maybeSingle(),
    getSessionOutcomeRows(viewerId),
  ]);

  const viewerOptedIn = !!viewerProfile?.show_on_leaderboard;
  const viewerCap = effectiveTradeCap(viewerAccount, today);
  const viewerName = viewerProfile?.display_name?.trim() || "You";

  const board: BoardRow[] = [
    boardRow({ userId: viewerId, name: viewerName, rows: viewerRows, cap: viewerCap, weekStart, isViewer: true, public: viewerOptedIn }),
  ];

  // Everyone else who opted in. If the service key isn't configured the
  // board still works -- it just shows you and your ghost.
  let admin: ReturnType<typeof createAdminClient> | null = null;
  try {
    admin = createAdminClient();
  } catch {
    admin = null;
  }

  if (admin) {
    const { data: others } = await admin
      .from("profiles")
      .select("user_id, display_name")
      .eq("show_on_leaderboard", true)
      .neq("user_id", viewerId);

    const ids = (others ?? []).map((p) => p.user_id as string);
    if (ids.length > 0) {
      const [{ data: sessions }, { data: accounts }] = await Promise.all([
        admin.from("xrill_sessions").select(SCORING_COLUMNS).in("user_id", ids),
        admin.from("accounts").select("user_id, max_trades_per_day, pending_max_trades, pending_max_trades_from").in("user_id", ids),
      ]);
      const rowsByUser = new Map<string, SessionOutcomeRow[]>();
      for (const s of (sessions ?? []) as RawRow[]) {
        rowsByUser.set(s.user_id, [...(rowsByUser.get(s.user_id) ?? []), toScoringRow(s)]);
      }
      const accountByUser = new Map((accounts ?? []).map((a) => [a.user_id as string, a]));
      for (const p of others ?? []) {
        board.push(
          boardRow({
            userId: p.user_id,
            name: (p.display_name as string | null)?.trim() || "Anonymous Trader",
            rows: rowsByUser.get(p.user_id) ?? [],
            cap: effectiveTradeCap(accountByUser.get(p.user_id), today),
            weekStart,
            isViewer: false,
            public: true,
          })
        );
      }
    }
  }

  return {
    weekStart,
    board: rankBoard(board),
    viewerOptedIn,
    ghost: bestPastWeek(viewerRows, weekStart, viewerCap),
  };
}
