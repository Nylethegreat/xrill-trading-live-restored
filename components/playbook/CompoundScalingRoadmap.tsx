"use client";

import { useState } from "react";
import {
  SCALING_PRINCIPAL,
  SCALING_TARGET,
  SCALING_MULTIPLE,
  WEEKLY_RATE_PLANS,
  MILESTONE_PACES,
  RED_EVERY_OPTIONS,
  balanceWithRedWeeks,
  effectiveWeeklyPercent,
  isRedWeek,
  weeksToTarget,
} from "@/lib/data/scaling";
import MyWeeklyTrack from "@/components/playbook/MyWeeklyTrack";

function money(v: number) {
  return `$${Math.round(v).toLocaleString()}`;
}

const IDEAL_WEEKS = [0, 3, 6, 9, 12, 15, 16];
const REAL_WEEKS = [0, 4, 8, 12, 16, 24, 32];

export default function CompoundScalingRoadmap() {
  // Realistic by default: one red week in four, at -25%.
  const [redEvery, setRedEvery] = useState<number>(4);
  const [redPercent, setRedPercent] = useState(25);
  const [customRate, setCustomRate] = useState(65);

  const ideal = redEvery === 0;
  const cols = ideal ? IDEAL_WEEKS : REAL_WEEKS;

  const customIdealWeeks = weeksToTarget(customRate, 0, 0);
  const customRealWeeks = weeksToTarget(customRate, redPercent, redEvery);
  const customEff = effectiveWeeklyPercent(customRate, redPercent, redEvery);

  return (
    <div className="space-y-6">
      {/* Ideal comparison (the original headline numbers) */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">The Ideal — Every Week Green</h3>
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-white/50">
              <tr>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Weekly Rate</th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Weeks to $100K</th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Final Balance</th>
              </tr>
            </thead>
            <tbody>
              {WEEKLY_RATE_PLANS.map((p) => (
                <tr key={p.ratePercent} className="border-t border-white/10">
                  <td className="px-3 py-2 font-mono font-medium text-white">{p.ratePercent}% Weekly</td>
                  <td className="px-3 py-2 text-white/70">{p.weeks} Weeks</td>
                  <td className="px-3 py-2 font-medium text-accent">{money(p.finalBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Milestone matrix with red weeks */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-white/60">Milestone Markers — Balance by Week</h3>
            <p className="mt-0.5 text-xs text-white/40">
              {ideal ? "Ideal model: every single week green." : `Realistic model: every ${ordinal(redEvery)} week is red at −${redPercent}%.`}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs text-white/50">
              Red weeks
              <select
                value={redEvery}
                onChange={(e) => setRedEvery(Number(e.target.value))}
                className="mt-1 block rounded border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-accent"
              >
                {RED_EVERY_OPTIONS.map((o) => (
                  <option key={o.every} value={o.every}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            {!ideal && (
              <label className="text-xs text-white/50">
                Red week size: <span className="font-mono text-loss">−{redPercent}%</span>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={redPercent}
                  onChange={(e) => setRedPercent(Number(e.target.value))}
                  className="mt-2 block w-40 accent-red-500"
                />
              </label>
            )}
          </div>
        </div>

        <div className="mt-3 overflow-x-auto rounded border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface text-white/50">
              <tr>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Green Weeks</th>
                {cols.map((w) => (
                  <th key={w} className={`px-3 py-2 text-xs font-medium uppercase tracking-wide ${isRedWeek(w, redEvery) ? "text-loss/80" : ""}`}>
                    {w === 0 ? "Start" : `Wk ${w}`}
                  </th>
                ))}
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Real Avg / Wk</th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Wks to $100K</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONE_PACES.map((rate) => {
                const eff = effectiveWeeklyPercent(rate, redPercent, redEvery);
                const wks = weeksToTarget(rate, redPercent, redEvery);
                return (
                  <tr key={rate} className="border-t border-white/10">
                    <td className="px-3 py-2 font-mono font-medium text-white">+{rate}%</td>
                    {cols.map((w) => {
                      const bal = balanceWithRedWeeks(w, rate, redPercent, redEvery);
                      const reached = bal >= SCALING_TARGET;
                      return (
                        <td key={w} className={`px-3 py-2 font-mono text-xs ${reached ? "font-bold text-accent" : bal < SCALING_PRINCIPAL ? "text-loss" : "text-white/70"}`}>
                          {money(bal)}
                        </td>
                      );
                    })}
                    <td className={`px-3 py-2 font-mono text-xs ${eff > 0 ? "text-white" : "text-loss"}`}>
                      {eff >= 0 ? "+" : ""}
                      {eff.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 font-mono text-xs font-semibold text-accent">{wks ?? "Never"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/45">
          &ldquo;Green Weeks&rdquo; is what a winning week makes; &ldquo;Real Avg / Wk&rdquo; is what the account actually
          averages once the red weeks are mixed in. Red column headers are the losing weeks.
        </p>
      </div>

      {/* Interactive calculator */}
      <div className="rounded border border-white/10 bg-white/5 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Try Your Own Rate</h3>
        <div className="mt-3 flex items-center gap-4">
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={customRate}
            onChange={(e) => setCustomRate(Number(e.target.value))}
            className="w-full accent-accent"
            aria-label="Green-week rate"
          />
          <span className="w-16 flex-none text-right font-mono text-sm text-white">{customRate}%</span>
        </div>
        <p className="mt-3 text-sm text-white/70">
          Every week green at <span className="font-mono text-white">{customRate}%</span>: $100K in{" "}
          <span className="font-mono font-semibold text-accent">{customIdealWeeks} weeks</span>.
        </p>
        {!ideal && (
          <p className="mt-1 text-sm text-white/70">
            With your red-week setting, the real average is{" "}
            <span className={`font-mono font-semibold ${customEff > 0 ? "text-white" : "text-loss"}`}>{customEff.toFixed(1)}%</span> a week —{" "}
            {customRealWeeks ? (
              <>
                $100K in <span className="font-mono font-semibold text-accent">{customRealWeeks} weeks</span>.
              </>
            ) : (
              <span className="text-loss">the account never gets there. The red weeks are eating the green ones.</span>
            )}
          </p>
        )}
      </div>

      <MyWeeklyTrack />

      <p className="rounded border border-caution/30 bg-caution/10 p-3 text-xs leading-relaxed text-white/60">
        Simplified illustrative model — fixed green and red weeks — not the actual position-sizing framework the
        system enforces trade-by-trade (that&apos;s the Twelve-Stage roadmap below). Real weekly returns vary;
        hypothetical performance never guarantees future results (CFTC Rule 4.41).
      </p>
    </div>
  );
}

function ordinal(n: number) {
  return n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
}

// The log equation behind the roadmap -- rendered at the bottom of the
// Playbook, so the page reads plan first, math last.
export function ScalingFormula() {
  const hundredWeeks = WEEKLY_RATE_PLANS.find((p) => p.ratePercent === 100)?.weeks ?? 9;
  return (
    <div className="rounded border border-primary/30 bg-primary/10 p-4">
      <p className="text-sm text-white/80">
        Weeks required to turn <span className="font-mono text-white">${SCALING_PRINCIPAL}</span> into{" "}
        <span className="font-mono text-white">${SCALING_TARGET.toLocaleString()}</span> ({SCALING_MULTIPLE}×) at a
        constant weekly return rate <span className="font-mono text-white">r</span>:
      </p>
      <p className="mt-2 rounded bg-black/30 px-3 py-2 text-center font-mono text-lg text-accent">
        n&nbsp;=&nbsp;ln({SCALING_MULTIPLE})&nbsp;/&nbsp;ln(r)
      </p>
      <p className="mt-2 text-xs text-white/50">
        Because a week can&apos;t be partially completed, the crossing week always lands a little above $100,000 —
        that overshoot is the &ldquo;Final Balance&rdquo; column in the roadmap above.
      </p>
      <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/50">
        In plain terms: <span className="font-mono text-white/70">ln()</span> is the natural logarithm — it answers
        &ldquo;how many times do I multiply by r before I&apos;ve multiplied by {SCALING_MULTIPLE} total?&rdquo; For a fixed
        multiplier that&apos;s always ln(target multiple) ÷ ln(per-step multiplier). At 100% weekly (r = 2, the balance
        doubles), that&apos;s{" "}
        <span className="font-mono text-white/70">
          ln({SCALING_MULTIPLE}) ÷ ln(2) ≈ {(Math.log(SCALING_MULTIPLE) / Math.log(2)).toFixed(1)}
        </span>{" "}
        — rounded up to {hundredWeeks} whole weeks.
      </p>
      <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/50">
        With red weeks, swap r for your <em>real</em> average: r = (1 + green)<sup>k−1</sup> × (1 − red), then take
        the k-th root, where one red week lands every k weeks. That&apos;s exactly what the &ldquo;Real Avg / Wk&rdquo;
        column computes.
      </p>
    </div>
  );
}

// Exit mechanics at each weekly pace -- also at the bottom of the Playbook,
// next to the formula.
export function AdjustingExitsAtPace() {
  return (
    <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">Adjusting Exits at This Pace</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/80">
        The weekly rate you&apos;re targeting dictates the exit mechanics that can actually deliver it — see the full{" "}
        <a href="/playbook/exits" className="underline hover:text-white">
          Adjusting Exits &amp; Trade Management
        </a>{" "}
        guide for the complete breakdown. The short version:
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/80">
        <li className="flex gap-2">
          <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-secondary" />
          <span>
            <span className="font-medium text-white">Chasing 75–100% weekly</span> (the 9–12 week pace) means
            shorter-dated or slightly OTM contracts — they carry the percentage leverage those rates require, but they
            also hit a 40% stop far faster. Structure-first exits and scaling 50% off at the first target matter more
            here, not less.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-secondary" />
          <span>
            <span className="font-medium text-white">Chasing 25–50% weekly</span> tolerates calmer, longer-dated swing
            structures — 30–45 DTE contracts with room to work — trading some percentage upside for a survivable stop
            distance.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-loss" />
          <span>
            <span className="font-medium text-white">After a red week</span>, the pace doesn&apos;t speed up to catch
            the plan. Same size, same stop, same rules — the finish line moves, the process doesn&apos;t.
          </span>
        </li>
      </ul>
    </div>
  );
}
