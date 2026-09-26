import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Section, Grid, Stat } from "@/components/Layout";
import { buildTradingProfile, type PerformanceArea } from "@/lib/intelligence";
import CoachCheckIn from "@/components/intelligence/CoachCheckIn";
import Link from "next/link";
import PulseBrain from "@/components/visuals/PulseBrain";
import NeuronPulse from "@/components/visuals/NeuronPulse";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

const AREA_ORDER: PerformanceArea[] = ["Daily Readiness", "Trade Gate", "Setup Quality", "Execution"];

export default async function IntelligencePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("xrill_sessions")
    .select("daily_score, trade_gate_score, setup_score, execution_score, trade_score, trade_authorized")
    .eq("user_id", user.id);

  const profile = buildTradingProfile(sessions ?? []);

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-[420px] opacity-30">
        <NeuronPulse className="h-full w-full" />
      </div>
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-bold tracking-widest text-white">🧠 XRILL INTELLIGENCE</h1>
          <p className="mt-1 text-sm text-white/50">
            Your mindset check-in, plus what your recorded sessions say about your process.
          </p>
        </div>
        <PulseBrain className="hidden h-24 w-24 flex-none sm:block" />
      </div>
      <Section title="🤖 XRILL Coach" subtitle="Pre-session mindset check-in">
        <CoachCheckIn />
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
                        className={`h-full rounded-full ${isWeakest ? "bg-caution" : "bg-accent"}`}
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
