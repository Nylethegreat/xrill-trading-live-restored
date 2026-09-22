"use client";

import { useState } from "react";
import {
  SCALING_PRINCIPAL,
  SCALING_TARGET,
  SCALING_MULTIPLE,
  WEEKLY_RATE_PLANS,
  SCALING_MILESTONE_WEEKS,
  balanceAtWeek,
  weeksToMultiply,
} from "@/lib/data/scaling";

function money(v: number) {
  return `$${Math.round(v).toLocaleString()}`;
}

export default function CompoundScalingRoadmap() {
  const [customRate, setCustomRate] = useState(65);
  const customWeeks = Math.ceil(weeksToMultiply(SCALING_MULTIPLE, customRate));
  const customFinal = balanceAtWeek(customWeeks, customRate);

  return (
    <div className="space-y-6">
      {/* Formula callout */}
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
          Because a week can't be partially completed, the actual crossing week always lands a little above
          $100,000 — that overshoot is exactly what the "Final Balance" column below shows.
        </p>
      </div>

      {/* Comparison table */}
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

      {/* Milestone matrix */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
          Milestone Markers — Balance by Week
        </h3>
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-white/50">
              <tr>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Weekly Rate</th>
                {SCALING_MILESTONE_WEEKS.map((w) => (
                  <th key={w} className="px-3 py-2 text-xs font-medium uppercase tracking-wide">
                    {w === 0 ? "Start" : `Wk ${w}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKLY_RATE_PLANS.map((p) => (
                <tr key={p.ratePercent} className="border-t border-white/10">
                  <td className="px-3 py-2 font-mono font-medium text-white">{p.ratePercent}%</td>
                  {SCALING_MILESTONE_WEEKS.map((w) => {
                    const bal = balanceAtWeek(w, p.ratePercent);
                    const reached = bal >= SCALING_TARGET;
                    return (
                      <td key={w} className={`px-3 py-2 font-mono text-xs ${reached ? "font-bold text-accent" : "text-white/70"}`}>
                        {money(bal)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          />
          <span className="w-16 flex-none text-right font-mono text-sm text-white">{customRate}%</span>
        </div>
        <p className="mt-3 text-sm text-white/70">
          At <span className="font-mono text-white">{customRate}%</span> weekly, ${SCALING_PRINCIPAL} crosses $100,000 in{" "}
          <span className="font-mono font-semibold text-accent">{customWeeks} weeks</span>, ending around{" "}
          <span className="font-mono font-semibold text-accent">{money(customFinal)}</span>.
        </p>
      </div>

      {/* Adjusting Exits, at this pace — the $100K roadmap is a compressed,
          higher-return-per-week extension of the Twelve-Stage system, so the
          exit mechanics have to flex with the rate you're actually chasing. */}
      <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">
          Adjusting Exits at This Pace
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          The weekly rate you're targeting above dictates the exit mechanics that can actually deliver it — see the
          full{" "}
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
              shorter-dated or slightly OTM contracts — they carry the percentage leverage those rates require, but
              they also hit a 40% stop far faster. Structure-first exits and scaling 50% off at the first target
              matter more here, not less.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-secondary" />
            <span>
              <span className="font-medium text-white">Chasing 50% weekly</span> (the 16-week pace) tolerates calmer,
              longer-dated swing structures — 30–45 DTE contracts with room to work — trading some percentage upside
              for a survivable stop distance.
            </span>
          </li>
        </ul>
      </div>

      <p className="rounded border border-caution/30 bg-caution/10 p-3 text-xs leading-relaxed text-white/60">
        This is a simplified illustrative model — constant weekly compounding, no losing weeks — not the actual
        position-sizing framework the system enforces trade-by-trade (that's the Twelve-Stage roadmap below).
        Real weekly returns vary; hypothetical performance never guarantees future results (CFTC Rule 4.41).
      </p>
    </div>
  );
}
