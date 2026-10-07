import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJournalExtras, getSessionOutcomeRows } from "@/lib/data/xrill-analytics-data";
import { getCodexDays } from "@/lib/data/journalCodex";
import { getDailyLossStatus } from "@/lib/data/dailyLossLock";
import { getTwoLossStatus } from "@/lib/data/twoLossLock";
import JournalClient from "@/components/journal/JournalClient";
import CodexClient from "@/components/journal/CodexClient";
import PsychAnchor from "@/components/journal/PsychAnchor";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";
import HoloBookFlip from "@/components/visuals/HoloBookFlip";
import HeaderText from "@/components/HeaderText";
import JournalSurface from "@/components/journal/JournalSurface";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

// Ported from the original CLI's journal()/review() and xrill_session_history()
// (main.py) — the full session-by-session record the CLI could show, plus the
// one write path (xrill_trade_outcome()) that nothing in the web app had ever
// exposed. This is that: every XRILL session, newest first, each one journaled
// with a real P/L, plan/exit-rule adherence, emotion, and lesson.

export default async function JournalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [rows, codexDays, extras, dailyLoss, twoLoss, { data: profile }] = await Promise.all([
    getSessionOutcomeRows(user.id),
    getCodexDays(user.id),
    getJournalExtras(user.id),
    getDailyLossStatus(user.id),
    getTwoLossStatus(user.id),
    supabase.from("profiles").select("hobbies").eq("user_id", user.id).maybeSingle(),
  ]);
  // Red Day Mode in the Codex: a journaled net loss today (Eastern trading
  // day) or the Two-Loss Lockout tripped.
  const redDay = {
    active: dailyLoss.netPnl < 0 || twoLoss.locked,
    netPnl: dailyLoss.netPnl,
    lockedOut: twoLoss.locked,
  };
  const hobbies: string[] = Array.isArray(profile?.hobbies) ? profile.hobbies : [];
  const newestFirst = [...rows].reverse();

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-40 opacity-40">
        <CandlestickGlow variant="banner" className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute -left-36 top-16 hidden opacity-90 xl:block">
        <HoloBookFlip />
      </div>
      <HeaderText className="relative font-mono text-xl font-bold tracking-widest">
        📓 XRILL JOURNAL <span aria-hidden="true">😊</span>
      </HeaderText>
      <p className="relative mt-1 text-sm text-white/50">
        Every XRILL session, in order. Record the real outcome on any session that doesn't have one yet.
      </p>

      <JournalSurface>
      <div className="relative mt-2">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">📖 Codex</h2>
        <p className="mb-3 text-xs text-white/40">
          A running, dated log of where your head's at — separate from trade sessions. The{" "}
          <a href="/dashboard" className="underline hover:text-white/70">
            Red Day card on your dashboard
          </a>{" "}
          links straight here.
        </p>
        <CodexClient days={codexDays} hobbies={hobbies} redDay={redDay} seed={dailyLoss.tradingDate} />
      </div>

      <div className="relative mt-8">
        <PsychAnchor />
      </div>

      <div className="relative mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">Session History</h2>
        <JournalClient rows={newestFirst} userId={user.id} trims={extras.trims} screenshots={extras.screenshots} />
      </div>
      </JournalSurface>
    </div>
  );
}
