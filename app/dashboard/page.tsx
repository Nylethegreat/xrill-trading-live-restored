import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { scoreGrade, calculateMaxRisk } from "@/lib/xrill";
import { clampRiskPercent } from "@/lib/riskProfile";
import Badge from "@/components/Badge";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";
import PreTradeChecklist from "@/components/PreTradeChecklist";
import MilestoneTracker from "@/components/MilestoneTracker";
import { isExpColor, isExpStyle } from "@/lib/expBar";
import NeonText from "@/components/visuals/NeonText";
import SuperStar from "@/components/visuals/SuperStar";
import RetroHud from "@/components/RetroHud";
import OpenPositionsPanel from "@/components/OpenPositionsPanel";
import MyWinsTicker from "@/components/MyWinsTicker";
import PowerUpChecklist from "@/components/visuals/PowerUpChecklist";
import RedDayCard from "@/components/visuals/RedDayCard";
import DailyLossMeter from "@/components/DailyLossMeter";
import TwoLossLockMeter from "@/components/TwoLossLockMeter";
import { getDailyLossStatus } from "@/lib/data/dailyLossLock";
import { getTwoLossStatus } from "@/lib/data/twoLossLock";
import { getOpenPositionsStatus } from "@/lib/data/openPositions";
import BouncingStarsToggle from "@/components/visuals/BouncingStarsToggle";
import DashboardThemePicker from "@/components/dashboard/DashboardThemePicker";
import NeonArcadeTexture from "@/components/visuals/textures/NeonArcadeTexture";
import DeepSpaceTexture from "@/components/visuals/textures/DeepSpaceTexture";
import DarkNeoTexture from "@/components/visuals/textures/DarkNeoTexture";
import NightDriveTexture from "@/components/visuals/textures/NightDriveTexture";
import TraderDeskTexture from "@/components/visuals/textures/TraderDeskTexture";
import SummerHazeTexture from "@/components/visuals/textures/SummerHazeTexture";
import MarketPulseTexture from "@/components/visuals/textures/MarketPulseTexture";
import RetroRoomTexture from "@/components/visuals/textures/RetroRoomTexture";
import BearBullTexture from "@/components/visuals/textures/BearBullTexture";
import { isDashboardTheme, type DashboardTheme } from "@/lib/data/dashboardThemes";

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

  const [{ data: account }, { data: sessions }, dailyLoss, twoLoss, openPositions, { data: profile }] = await Promise.all([
    supabase.from("accounts").select("balance, risk_percent, daily_loss_limit").eq("user_id", user!.id).maybeSingle(),
    supabase
      .from("xrill_sessions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    getDailyLossStatus(user!.id),
    getTwoLossStatus(user!.id),
    getOpenPositionsStatus(user!.id),
    supabase.from("profiles").select("dashboard_theme, display_name, show_name_on_ladder, exp_bar_style, exp_bar_color").eq("user_id", user!.id).maybeSingle(),
  ]);

  const dashboardTheme: DashboardTheme =
    profile?.dashboard_theme && isDashboardTheme(profile.dashboard_theme) ? profile.dashboard_theme : "classic";

  const balance = account?.balance ?? 50000;
  const riskPercent = clampRiskPercent(account?.risk_percent ?? 1);
  const maxRisk = calculateMaxRisk(balance, riskPercent);

  const allSessions = sessions ?? [];
  const latest = allSessions[0] ?? null;
  // "Last Session" breaks down the gates, so it uses the last session that
  // actually ran them (a logged-after trade has none).
  const last = allSessions.find((s) => !s.logged_after) ?? null;
  const recent = allSessions.slice(0, 5);

  const total = allSessions.length;
  const authorized = allSessions.filter((s) => s.trade_authorized).length;
  const loggedAfter = allSessions.filter((s) => s.logged_after).length;
  const blocked = total - authorized - loggedAfter;
  // Logged-after trades skipped the gates, so they have no XRILL score to
  // average -- score stats only cover sessions that ran the gates.
  const gated = allSessions.filter((s) => !s.logged_after);
  const avgScore = gated.length > 0 ? gated.reduce((sum, s) => sum + (s.trade_score ?? 0), 0) / gated.length : 0;
  const highScore = gated.length > 0 ? Math.max(...gated.map((s) => s.trade_score ?? 0)) : 0;
  const lowScore = gated.length > 0 ? Math.min(...gated.map((s) => s.trade_score ?? 0)) : 0;

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10">
      <DashboardBackdrop theme={dashboardTheme} />
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
        {latest?.logged_after ? (
          <p className="text-loss">🚨 LAST TRADE LOGGED AFTER THE FACT — gates were skipped. Journal it and run XRILL first next time.</p>
        ) : !last ? (
          <p className="text-white/60">🟡 SYSTEM READY — no sessions yet. Start one when you're ready.</p>
        ) : (
          <p className={last.trade_authorized ? "text-accent" : "text-blocked"}>
            {last.trade_authorized ? "🟢 LAST TRADE AUTHORIZED" : "🟣 LAST TRADE BLOCKED"} — XRILL Score: {last.trade_score}/100
          </p>
        )}
      </div>

      <OpenPositionsPanel
        positions={openPositions.positions}
        totalRisk={openPositions.totalRisk}
        limit={openPositions.limit}
        dailyLossLimit={dailyLoss.limit}
      />

      <div className="relative mt-4">
        <PreTradeChecklist />
      </div>

      <MyWinsTicker userId={user!.id} className="mt-4 h-40" />

      <Section title="Account">
        <Grid>
          <Stat label="Balance" value={money(balance)} />
          <Stat label="Risk Per Trade" value={`${riskPercent}%`} />
          <Stat label="Maximum Trade Risk" value={money(maxRisk)} />
        </Grid>
        <div className="mt-3 space-y-3">
          <DailyLossMeter netPnl={dailyLoss.netPnl} limit={dailyLoss.limit} />
          <TwoLossLockMeter stopOutCount={twoLoss.stopOutCount} threshold={twoLoss.threshold} />
        </div>
      </Section>

      <div className="mt-8 space-y-3">
        <PowerUpChecklist />
        <RedDayCard />
      </div>

      <Section title="Double-Up Ladder" subtitle="$100 → $250 → $500 → $1,000 → … → $1M">
        <MilestoneTracker
          initialBalance={balance}
          displayName={profile?.show_name_on_ladder !== false ? profile?.display_name?.trim() || null : null}
          initialStyle={isExpStyle(profile?.exp_bar_style) ? profile.exp_bar_style : "classic"}
          initialColor={isExpColor(profile?.exp_bar_color) ? profile.exp_bar_color : "gold"}
        />
      </Section>

      {last && (
        <Section title={last.engine === "daytrade" ? "Last Session — ⚡ Daytrade Engine" : "Last Session"}>
          <Grid>
            <Stat label="Ticker" value={last.ticker ?? "—"} />
            <Stat label="Type" value={last.direction ?? "—"} />
            <Stat label="Contracts" value={String(last.contracts ?? "—")} />
            <Stat label="Risk" value={money(last.trade_risk)} />
            <Stat label="Reward" value={money(last.trade_reward)} />
            <Stat label="R:R" value={last.rr ? last.rr.toFixed(2) : "—"} />
          </Grid>

          {last.engine === "daytrade" ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Trade Gate" value={`${last.trade_gate_score}/2`} badge={last.trade_gate_score >= 2 ? { text: "CLEAR", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
              <Stat label="Setup Read" value={`${last.setup_score}/25`} badge={last.setup_score >= 20 ? { text: "CLEAR", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
              <Stat label="Execution" value={`${last.execution_score}/5`} badge={last.execution_score >= 4 ? { text: "APPROVED", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
              <Stat label="Verdict" value={last.trade_authorized ? "AUTHORIZED" : "BLOCKED"} badge={last.trade_authorized ? { text: "AUTHORIZED", tone: "good" as const } : { text: "BLOCKED", tone: "blocked" as const }} />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Daily" value={`${last.daily_score}/4`} badge={last.daily_score >= 4 ? { text: "READY", tone: "good" } : last.daily_score >= 3 ? { text: "CAUTION", tone: "caution" } : { text: "NOT READY", tone: "blocked" }} />
              <Stat label="Gate" value={`${last.trade_gate_score}/5`} badge={last.trade_gate_score >= 4 ? { text: "CLEAR", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
              <Stat label="Setup" value={`${last.setup_score}/25`} badge={last.setup_score >= 25 ? { text: "A+ SETUP", tone: "good" } : last.setup_score >= 20 ? { text: "GOOD SETUP", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
              <Stat label="Execution" value={`${last.execution_score}/5`} badge={last.execution_score >= 4 ? { text: "APPROVED", tone: "good" } : { text: "BLOCKED", tone: "blocked" }} />
              <Stat label="XRILL Score" value={`${last.trade_score}/100`} badge={last.trade_authorized ? { text: "AUTHORIZED", tone: "good" as const } : { text: "BLOCKED", tone: "blocked" as const }} />
              <Stat label="Grade" value={scoreGrade(last.trade_score ?? 0)} />
            </div>
          )}
        </Section>
      )}

      <Section title="🎨 Customize XRILL Status" subtitle="Background and star field — only affects your own view.">
        <DashboardThemePicker current={dashboardTheme} />
        <BouncingStarsToggle className="mt-3" />
      </Section>

      <Section title="Performance">
        <Grid>
          <Stat label="Total Sessions" value={String(total)} />
          <Stat label="Authorized" value={String(authorized)} />
          <Stat label="Blocked" value={String(blocked)} />
          {loggedAfter > 0 && <Stat label="Logged After" value={String(loggedAfter)} />}
          <Stat label="Authorization Rate" value={total > 0 ? `${((authorized / total) * 100).toFixed(1)}%` : "—"} />
          <Stat label="Average Score" value={gated.length > 0 ? `${avgScore.toFixed(1)}/100` : "—"} />
          <Stat label="Highest / Lowest" value={gated.length > 0 ? `${highScore} / ${lowScore}` : "—"} />
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
                  {s.engine === "daytrade" && <span className="ml-1.5 text-daytrade">⚡</span>}
                </span>
                <span className="text-white/60">{s.logged_after ? "No gates" : s.engine === "daytrade" ? "Daytrade" : `Score: ${s.trade_score}`}</span>
                <span className={s.logged_after ? "text-loss" : s.trade_authorized ? "text-accent" : "text-blocked"}>
                  {s.logged_after ? "🚨 LOGGED AFTER" : s.trade_authorized ? "🟢 AUTHORIZED" : "🟣 BLOCKED"}
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

// Full-viewport backdrop behind everything on XRILL Status. Fixed at
// -z-20 inside the layout's z-10 content layer: under the page content and
// under the star field (-z-10), above the site-wide TerminalBackdrop.
function DashboardBackdrop({ theme }: { theme: DashboardTheme }) {
  if (theme === "classic") return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20">
      {theme === "neon_arcade" && <NeonArcadeTexture className="opacity-70" />}
      {theme === "deep_space" && <DeepSpaceTexture className="opacity-80" />}
      {theme === "dark_neo" && <DarkNeoTexture className="opacity-90" />}
      {theme === "night_drive" && <NightDriveTexture className="opacity-75" />}
      {theme === "trader_desk" && <TraderDeskTexture className="opacity-70" />}
      {theme === "summer_haze" && <SummerHazeTexture className="opacity-60" />}
      {theme === "market_pulse" && <MarketPulseTexture className="opacity-75" />}
      {theme === "retro_room" && <RetroRoomTexture className="opacity-65" />}
      {theme === "bear_bull" && <BearBullTexture className="opacity-60" />}
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
