import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { scoreGrade } from "@/lib/xrill";
import Badge from "@/components/Badge";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";
import PreTradeChecklist from "@/components/PreTradeChecklist";
import MilestoneTracker, { levelInfo } from "@/components/MilestoneTracker";
import NeonText from "@/components/visuals/NeonText";
import SuperStar from "@/components/visuals/SuperStar";
import RetroHud from "@/components/RetroHud";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

function money(v: number | null | undefined) {
  if (v === null || v === undefined) return "$0.00";
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: account }, { data: sessions }] = await Promise.all([
    supabase.from("accounts").select("balance, risk_percent, daily_loss_limit").eq("user_id", user!.id).maybeSingle(),
    supabase
      .from("xrill_sessions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;
  const maxRisk = balance * (riskPercent / 100);

  const allSessions = sessions ?? [];
  const last = allSessions[0] ?? null;
  const recent = allSessions.slice(0, 5);

  const total = allSessions.length;
  const authorized = allSessions.filter((s) => s.trade_authorized).length;
  const blocked = total - authorized;
  const avgScore = total > 0 ? allSessions.reduce((sum, s) => sum + (s.trade_score ?? 0), 0) / total : 0;
  const highScore = total > 0 ? Math.max(...allSessions.map((s) => s.trade_score ?? 0)) : 0;
  const lowScore = total > 0 ? Math.min(...allSessions.map((s) => s.trade_score ?? 0)) : 0;

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-40 opacity-40">
        <CandlestickGlow variant="banner" className="h-full w-full" />
      </div>
      <SuperStar />
      <div className="relative flex items-center justify-between gap-3">
        <NeonText as="h1" className="font-mono text-xl font-bold tracking-widest text-accent">
          XRILL STATUS
        </NeonText>
        <RetroHud balance={balance} sessions={allSessions} />
      </div>

      <div className="mt-3 rounded border border-white/10 bg-white/5 p-4">
        {!last ? (
          <p className="text-white/60">🟡 SYSTEM READY — no sessions yet. Start one when you're ready.</p>
        ) : (
          <p className={last.trade_authorized ? "text-accent" : "text-blocked"}>
            {last.trade_authorized ? "🟢 LAST TRADE AUTHORIZED" : "🟣 LAST TRADE BLOCKED"} — XRILL Score: {last.trade_score}/100
          </p>
        )}
      </div>

      <div className="relative mt-4">
        <PreTradeChecklist />
      </div>

      <Section title="Account">
        <Grid>
          <Stat label="Balance" value={money(balance)} />
          <Stat label="Risk Per Trade" value={`${riskPercent}%`} />
          <Stat label="Maximum Trade Risk" value={money(maxRisk)} />
        </Grid>
      </Section>

      <Section title="Double-Up Ladder" subtitle="$250 → $500 → $1,000 → $2,000 → $5,000">
        <MilestoneTracker initialBalance={balance} />
      </Section>

      {last && (
        <Section title="Last Session">
          <Grid>
            <Stat label="Ticker" value={last.ticker ?? "—"} />
            <Stat label="Type" value={last.direction ?? "—"} />
            <Stat label="Contracts" value={String(last.contracts ?? "—")} />
            <Stat label="Risk" value={money(last.trade_risk)} />
            <Stat label="Reward" value={money(last.trade_reward)} />
            <Stat label="R:R" value={last.rr ? last.rr.toFixed(2) : "—"} />
          </Grid>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Daily" value={`${last.daily_score}/4`} badge={last.daily_score >= 4 ? { text: "READY", tone: "good" } : last.daily_score >= 3 ? { text: "CAUTION", tone: "caution" } : { text: "NOT READY", tone: "blocked" }} />
            <Stat label="Gate" value={`${last.trade_gate_score}/5`} badge={last.trade_gate_score >= 4 ? { text: "CLEAR", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
            <Stat label="Setup" value={`${last.setup_score}/25`} badge={last.setup_score >= 25 ? { text: "A+ SETUP", tone: "good" } : last.setup_score >= 20 ? { text: "GOOD SETUP", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
            <Stat label="Execution" value={`${last.execution_score}/5`} badge={last.execution_score >= 4 ? { text: "APPROVED", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
            <Stat label="XRILL Score" value={`${last.trade_score}/100`} badge={last.trade_authorized ? { text: "AUTHORIZED", tone: "good" as const } : { text: "BLOCKED", tone: "blocked" as const }} />
            <Stat label="Grade" value={scoreGrade(last.trade_score ?? 0)} />
          </div>
        </Section>
      )}

      <Section title="Performance">
        <Grid>
          <Stat label="Total Sessions" value={String(total)} />
          <Stat label="Authorized" value={String(authorized)} />
          <Stat label="Blocked" value={String(blocked)} />
          <Stat label="Authorization Rate" value={total > 0 ? `${((authorized / total) * 100).toFixed(1)}%` : "—"} />
          <Stat label="Average Score" value={total > 0 ? `${avgScore.toFixed(1)}/100` : "—"} />
          <Stat label="Highest / Lowest" value={total > 0 ? `${highScore} / ${lowScore}` : "—"} />
        </Grid>
      </Section>

      <Section title="Recent Sessions">
        {recent.length === 0 ? (
          <p className="text-sm text-white/50">No sessions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded border border-white/10 px-3 py-2 text-sm"
              >
                <span>
                  #{s.id} <span className="text-white/60">{s.ticker} {s.direction}</span>
                </span>
                <span className="text-white/60">Score: {s.trade_score}</span>
                <span className={s.trade_authorized ? "text-accent" : "text-blocked"}>
                  {s.trade_authorized ? "🟢 AUTHORIZED" : "🟣 BLOCKED"}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-white/40">
          <Link href="/journal" className="text-primary underline">
            Open the full Journal
          </Link>{" "}
          to record trade outcomes and review every session.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}

function Stat({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: { text: string; tone: "good" | "blocked" | "caution" | "info" | "neutral" };
}) {
  return (
    <div className="rounded border border-white/10 bg-surface p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/50">{label}</div>
        {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
