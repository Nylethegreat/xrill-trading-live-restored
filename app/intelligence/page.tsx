import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Section, Grid, Stat } from "@/components/Layout";
import { buildTradingProfile, type PerformanceArea } from "@/lib/intelligence";
import PositionCheckIn, { type CheckInPosition, type CheckInsBySession } from "@/components/intelligence/PositionCheckIn";
import { getOpenPositionsStatus } from "@/lib/data/openPositions";
import Link from "next/link";
import PulseBrain from "@/components/visuals/PulseBrain";
import HeaderText from "@/components/HeaderText";
import { NeuronBackdropControl } from "@/components/visuals/BackdropControls";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

const AREA_ORDER: PerformanceArea[] = ["Daily Readiness", "Trade Gate", "Setup Quality", "Execution"];

function positionLabel(p: {
  id: number;
  ticker: string | null;
  direction: string | null;
  strike?: number | null;
  created_at: string;
}) {
  const date = new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
  const parts = [p.ticker ?? "—", p.direction ?? "", p.strike ? `$${p.strike}` : ""].filter(Boolean).join(" ");
  return `${parts} · ${date} · #${p.id}`;
}

export default async function IntelligencePage({ searchParams }: { searchParams?: { position?: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("xrill_sessions")
    .select("daily_score, trade_gate_score, setup_score, execution_score, trade_score, trade_authorized")
    // after-the-fact logs skipped the gates; nothing to profile
    .eq("logged_after", false)
    .eq("user_id", user.id);

  const profile = buildTradingProfile(sessions ?? []);

  // Positions to check in on: everything still open, plus trades closed in
  // the last 7 days (so the "after" snapshot can be taken once you're out).
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [openStatus, { data: recentOutcomes }] = await Promise.all([
    getOpenPositionsStatus(user.id),
    supabase
      .from("xrill_outcomes")
      .select("session_id, ticker, direction, created_at")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false }),
  ]);

  const checkInPositions: CheckInPosition[] = [
    ...openStatus.positions.map((p) => ({ id: p.id, label: positionLabel(p), status: "open" as const })),
    ...(recentOutcomes ?? []).map((o) => ({
      id: o.session_id as number,
      label: positionLabel({ id: o.session_id, ticker: o.ticker, direction: o.direction, created_at: o.created_at }),
      status: "closed" as const,
    })),
  ];

  const checkIns: CheckInsBySession = {};
  if (checkInPositions.length > 0) {
    const { data: rows } = await supabase
      .from("position_checkins")
      .select("session_id, phase, confidence, discipline, emotional_control, patience, note")
      .eq("user_id", user.id)
      .in(
        "session_id",
        checkInPositions.map((p) => p.id)
      );
    for (const r of rows ?? []) {
      const entry = (checkIns[r.session_id] ??= {});
      entry[r.phase as "before" | "after"] = {
        confidence: r.confidence,
        discipline: r.discipline,
        emotionalControl: r.emotional_control,
        patience: r.patience,
        note: r.note,
      };
    }
  }

  const requested = Number(searchParams?.position);
  const initialPositionId = Number.isFinite(requested) && requested > 0 ? requested : null;

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10">
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <HeaderText className="font-mono text-xl font-bold tracking-widest">🧠 XRILL INTELLIGENCE</HeaderText>
          <p className="mt-1 text-sm text-white/50">
            Check in on each position you take, plus what your recorded sessions say about your process.
          </p>
          <NeuronBackdropControl className="mt-3" />
        </div>
        <PulseBrain className="hidden h-24 w-24 flex-none sm:block" />
      </div>
      <Section title="🤖 XRILL Coach" subtitle="Position check-in — before and after every trade">
        <p className="mb-3 text-xs text-white/50">
          Cleared the gate? Log how you feel going in. Out of the trade? Log it again. How you feel before a trade and
          how you feel after are two different things — keeping them separate is how you find out what trades actually
          do to you, instead of letting the result rewrite how you remember feeling.
        </p>
        <PositionCheckIn positions={checkInPositions} checkIns={checkIns} initialPositionId={initialPositionId} />
      </Section>

      {!profile ? (
        <Section title="📋 Trading Profile">
          <div className="rounded border border-white/10 bg-white/5 p-6 text-center text-white/60">
            No XRILL sessions found yet. Complete some sessions first, then come back here for a profile.
          </div>
        </Section>
      ) : (
        <>
          <Section title="📋 Trading Profile">
            <Grid cols={3}>
              <Stat label="Sessions Analyzed" value={String(profile.totalSessions)} />
              <Stat label="Average XRILL Score" value={`${profile.averageTradeScore.toFixed(1)}/100`} />
              <Stat label="Authorization Rate" value={`${profile.authorizationRate.toFixed(1)}%`} />
            </Grid>
          </Section>

          <Section title="⚙️ Performance Areas">
            <div className="space-y-2">
              {AREA_ORDER.map((area) => {
                const a = profile.areas[area];
                const isStrongest = area === profile.strongest;
                const isWeakest = area === profile.weakest;
                return (
                  <div key={area} className="rounded border border-white/10 bg-surface p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {area}
                        {isStrongest && <span title="Strongest area">🟢</span>}
                        {isWeakest && <span title="Weakest area">🟠</span>}
                      </span>
                      <span className="font-mono text-white/60">
                        {a.raw.toFixed(2)}/{a.max} ({a.percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          isWeakest
                            ? "bg-caution motion-safe:animate-perf-glow-caution"
                            : "bg-accent motion-safe:animate-perf-glow-accent"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, a.percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="🔍 Observations">
            <ul className="space-y-1.5 text-sm text-white/80">
              {profile.observations.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </Section>

          <Section title="✅ Recommendation">
            <div className="rounded border border-primary/30 bg-primary/10 p-4 text-sm text-white">
              {profile.recommendation}
            </div>
          </Section>

          <p className="mt-6 text-xs text-white/40">
            Want the full breakdown by ticker, setup type, and score bucket? See{" "}
            <Link href="/analytics" className="text-primary underline">
              Analytics
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
