import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionOutcomeRows } from "@/lib/data/xrill-analytics-data";
import JournalClient from "@/components/journal/JournalClient";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";
import WeeklyAuditCard from "@/components/WeeklyAuditCard";

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

  const rows = await getSessionOutcomeRows(user.id);
  const newestFirst = [...rows].reverse();

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-40 opacity-40">
        <CandlestickGlow variant="banner" className="h-full w-full" />
      </div>
      <h1 className="relative font-mono text-xl font-bold tracking-widest text-white">📓 XRILL JOURNAL</h1>
      <p className="relative mt-1 text-sm text-white/50">
        Every XRILL session, in order. Record the real outcome on any session that doesn't have one yet.
      </p>

      <div className="relative mt-6">
        <WeeklyAuditCard />
      </div>

      <div className="relative mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">Session History</h2>
        <JournalClient rows={newestFirst} />
      </div>
    </div>
  );
}
