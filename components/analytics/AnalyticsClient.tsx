"use client";

import { useMemo, useState } from "react";
import { Section, Grid, Stat } from "@/components/Layout";
import EquityCurve from "@/components/charts/EquityCurve";
import BreakdownTable from "@/components/charts/BreakdownTable";
import { getAnalyticsSummary, type SessionOutcomeRow } from "@/lib/analytics";

function money(v: number) {
  if (!isFinite(v)) return v > 0 ? "∞" : "$0.00";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toLocaleString(undefined, { style: "currency", currency: "USD" })}`;
}

function uniqueSorted(values: (string | null)[]) {
  return Array.from(new Set(values.filter((v): v is string => !!v && v.trim() !== ""))).sort();
}

function ChipToggle({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-white/50">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                const next = new Set(selected);
                if (active) next.delete(opt);
                else next.add(opt);
                onChange(next);
              }}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${
                active
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-white/15 bg-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsClient({ rows }: { rows: SessionOutcomeRow[] }) {
  const tickerOptions = useMemo(() => uniqueSorted(rows.map((r) => r.ticker)), [rows]);
  const setupOptions = useMemo(() => uniqueSorted(rows.map((r) => r.setup_type)), [rows]);
  const directionOptions = useMemo(() => uniqueSorted(rows.map((r) => r.direction)), [rows]);

  const [tickers, setTickers] = useState(new Set(tickerOptions));
  const [setups, setSetups] = useState(new Set(setupOptions));
  const [directions, setDirections] = useState(new Set(directionOptions));
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (r.ticker && tickers.size > 0 && !tickers.has(r.ticker)) return false;
      if (r.setup_type && setups.size > 0 && !setups.has(r.setup_type)) return false;
      if (r.direction && directions.size > 0 && !directions.has(r.direction)) return false;
      const day = r.session_date ?? r.created_at?.slice(0, 10);
      if (fromDate && day && day < fromDate) return false;
      if (toDate && day && day > toDate) return false;
      return true;
    });
  }, [rows, tickers, setups, directions, fromDate, toDate]);

  const summary = useMemo(() => getAnalyticsSummary(filtered), [filtered]);

  function resetFilters() {
    setTickers(new Set(tickerOptions));
    setSetups(new Set(setupOptions));
    setDirections(new Set(directionOptions));
    setFromDate("");
    setToDate("");
  }

  if (rows.length === 0) {
    return (
      <div className="mt-8 rounded border border-white/10 bg-white/5 p-6 text-center text-white/60">
        No XRILL sessions recorded yet. Complete a session to see analytics here.
      </div>
    );
  }

  return (
    <>
      <Section title="🔎 Filters">
        <div className="rounded border border-white/10 bg-surface p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-white/50">Date range</div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded border border-white/15 bg-transparent px-2 py-1 text-xs text-white/80"
                />
                <span className="text-white/30">–</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded border border-white/15 bg-transparent px-2 py-1 text-xs text-white/80"
                />
              </div>
            </div>
            <ChipToggle label="Ticker" options={tickerOptions} selected={tickers} onChange={setTickers} />
            <ChipToggle label="Setup type" options={setupOptions} selected={setups} onChange={setSetups} />
            <ChipToggle label="Direction" options={directionOptions} selected={directions} onChange={setDirections} />
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-xs text-white/40 underline hover:text-white/70"
          >
            🔄 Reset filters
          </button>
        </div>
      </Section>

      <Section title="📊 Performance Overview">
        <Grid cols={4}>
          <Stat label="Total Sessions" value={String(summary.totalSessions)} />
          <Stat label="Win Rate" value={`${summary.winRate.toFixed(1)}%`} />
          <Stat label="Total P&L" value={money(summary.netPnl)} tone={summary.netPnl >= 0 ? "good" : "loss"} />
          <Stat label="Expectancy" value={money(summary.expectancy)} tone={summary.expectancy >= 0 ? "good" : "loss"} />
          <Stat label="Average Win" value={money(summary.averageWinner)} tone="good" />
          <Stat label="Average Loss" value={money(summary.averageLoser)} tone="loss" />
          <Stat label="Profit Factor" value={isFinite(summary.profitFactor) ? summary.profitFactor.toFixed(2) : "∞"} />
          <Stat label="Average R" value={`${summary.averageR.toFixed(2)}R`} />
        </Grid>
      </Section>

      <Section title="🧠 XRILL Decision Engine" subtitle="Average score per gate across selected sessions">
        <Grid cols={4}>
          <Stat label="Avg XRILL Score" value={`${summary.avgTradeScore.toFixed(1)}/100`} />
          <Stat label="Avg Daily" value={`${summary.avgDailyScore.toFixed(1)}/4`} />
          <Stat label="Avg Gate" value={`${summary.avgGateScore.toFixed(1)}/5`} />
          <Stat label="Avg Setup" value={`${summary.avgSetupScore.toFixed(1)}/25`} />
          <Stat label="Avg Execution" value={`${summary.avgExecutionScore.toFixed(1)}/5`} />
        </Grid>
      </Section>

      <Section title="🛡️ Risk & Authorization">
        <Grid cols={4}>
          <Stat label="Authorized" value={String(summary.authorizedTrades)} tone="good" />
          <Stat label="Authorization Rate" value={`${summary.authorizationRate.toFixed(1)}%`} />
          <Stat label="Rejected" value={String(summary.totalSessions - summary.authorizedTrades)} tone="loss" />
          <Stat
            label="Rejection Rate"
            value={`${(100 - summary.authorizationRate).toFixed(1)}%`}
          />
        </Grid>
      </Section>

      <Section title="💰 Trade Economics">
        <Grid cols={4}>
          <Stat label="Avg Trade Risk" value={money(summary.avgTradeRisk)} />
          <Stat label="Avg Trade Reward" value={money(summary.avgTradeReward)} />
          <Stat label="Avg Holding Time" value={`${Math.round(summary.holdingTime.averageMinutes)} min`} />
          <Stat label="Max Drawdown" value={money(-Math.abs(summary.maxDrawdown))} tone={summary.maxDrawdown > 0 ? "loss" : "good"} />
        </Grid>
      </Section>

      <Section title="📈 Equity Curve" subtitle="Cumulative realized P&L across completed trades, in order">
        <div className="rounded border border-white/10 bg-surface p-4">
          <EquityCurve points={summary.equityCurve} />
        </div>
      </Section>

      <Section title="🎯 Performance by Score Bucket">
        <BreakdownTable
          title="XRILL Score Bucket"
          groups={Object.fromEntries(summary.scoreBuckets.map((b) => [b.bucket, b]))}
          order={summary.scoreBuckets.map((b) => b.bucket)}
        />
      </Section>

      <Section title="Breakdowns">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BreakdownTable title="By Ticker" groups={summary.tickers} />
          <BreakdownTable title="By Direction" groups={summary.directions} />
          <BreakdownTable title="By Market Session" groups={summary.marketSessions} />
          <BreakdownTable title="By Setup Type" groups={summary.setupTypes} />
        </div>
      </Section>

      <Section title="🧭 Discipline">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded border border-white/10 bg-surface p-3">
            <div className="mb-2 text-xs font-medium text-white/50">Followed the plan?</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Yes ({summary.planAdherence.followed_plan.count})</span>
                <span className={summary.planAdherence.followed_plan.netPnl >= 0 ? "text-accent" : "text-loss"}>
                  {money(summary.planAdherence.followed_plan.netPnl)} · {summary.planAdherence.followed_plan.winRate.toFixed(0)}% win
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">No ({summary.planAdherence.did_not_follow_plan.count})</span>
                <span className={summary.planAdherence.did_not_follow_plan.netPnl >= 0 ? "text-accent" : "text-loss"}>
                  {money(summary.planAdherence.did_not_follow_plan.netPnl)} · {summary.planAdherence.did_not_follow_plan.winRate.toFixed(0)}% win
                </span>
              </div>
            </div>
          </div>
          <div className="rounded border border-white/10 bg-surface p-3">
            <div className="mb-2 text-xs font-medium text-white/50">Followed exit rules?</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Yes ({summary.exitRuleAdherence.followed_exit_rules.count})</span>
                <span className={summary.exitRuleAdherence.followed_exit_rules.netPnl >= 0 ? "text-accent" : "text-loss"}>
                  {money(summary.exitRuleAdherence.followed_exit_rules.netPnl)} · {summary.exitRuleAdherence.followed_exit_rules.winRate.toFixed(0)}% win
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">No ({summary.exitRuleAdherence.did_not_follow_exit_rules.count})</span>
                <span className={summary.exitRuleAdherence.did_not_follow_exit_rules.netPnl >= 0 ? "text-accent" : "text-loss"}>
                  {money(summary.exitRuleAdherence.did_not_follow_exit_rules.netPnl)} · {summary.exitRuleAdherence.did_not_follow_exit_rules.winRate.toFixed(0)}% win
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="🗃️ Session Log" subtitle={`${filtered.length} of ${rows.length} sessions match the current filters`}>
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Ticker</th>
                <th className="px-3 py-2">Dir</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Authorized</th>
                <th className="px-3 py-2">R</th>
                <th className="px-3 py-2">P&L</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map((r) => (
                <tr key={r.session_id} className="border-t border-white/5">
                  <td className="px-3 py-1.5 text-white/60">{r.session_date ?? "—"}</td>
                  <td className="px-3 py-1.5">{r.ticker ?? "—"}</td>
                  <td className="px-3 py-1.5 text-white/60">{r.direction ?? "—"}</td>
                  <td className="px-3 py-1.5">{r.trade_score ?? "—"}</td>
                  <td className="px-3 py-1.5">{r.trade_authorized ? "🟢" : "🟣"}</td>
                  <td className="px-3 py-1.5 text-white/60">{r.risk_multiple !== null ? `${r.risk_multiple.toFixed(2)}R` : "—"}</td>
                  <td className={`px-3 py-1.5 ${r.profit_loss !== null ? (r.profit_loss >= 0 ? "text-accent" : "text-loss") : "text-white/40"}`}>
                    {r.profit_loss !== null ? money(r.profit_loss) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
