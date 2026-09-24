"use client";

import { useState } from "react";
import { RISK_TIERS, tierForWeeklyRate, riskPercentForWeeklyRate } from "@/lib/data/riskTiers";
import { calculateMaxRisk } from "@/lib/xrill";
import { weeksToMultiply, balanceAtWeek } from "@/lib/data/scaling";

// $500 baseline for this illustration -- deliberately a different (smaller,
// more relatable) starting point than the $250 Twelve-Stage roadmap or the
// $250 -> $100K Compound Scaling model further down the page. All three
// share the same 60/40 allocation math and -40% structural stop; only the
// starting number and the story being told differ.
const MICRO_BASELINE = 500;
const SIM_TARGET = 2500;
const SIM_MULTIPLE = SIM_TARGET / MICRO_BASELINE; // 5x

const TONE_CLASSES: Record<string, string> = {
  primary: "border-primary/30 bg-primary/10",
  secondary: "border-secondary/30 bg-secondary/10",
  caution: "border-caution/30 bg-caution/10",
};
const TONE_TEXT: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  caution: "text-caution",
};
const TONE_RING: Record<string, string> = {
  primary: "ring-2 ring-primary",
  secondary: "ring-2 ring-secondary",
  caution: "ring-2 ring-caution",
};

function money(v: number) {
  return `$${Math.round(v).toLocaleString()}`;
}

export default function ExecutionCompoundingExamples() {
  const [weeklyRate, setWeeklyRate] = useState(75); // defaults into Moderate

  const activeTier = tierForWeeklyRate(weeklyRate);
  const riskPercent = riskPercentForWeeklyRate(weeklyRate);

  // Micro-account math breakdown -- a worked $500 example at a 12% risk
  // ceiling (the top of the Moderate tier), run through the exact same
  // calculateMaxRisk() the real Risk Manager step calls server-side, so
  // this stays real math, not a made-up illustration.
  const workedRiskPercent = 12;
  const workedMaxRisk = calculateMaxRisk(MICRO_BASELINE, workedRiskPercent);
  const allocation60 = MICRO_BASELINE * 0.6;
  const idle40 = MICRO_BASELINE * 0.4;
  const sampleEntryPremium = 1.0;
  const sampleStopPremium = sampleEntryPremium * 0.6; // -40% structural stop
  const riskPerContract = (sampleEntryPremium - sampleStopPremium) * 100;
  const maxContracts = Math.floor(workedMaxRisk / riskPerContract);
  const actualRiskDollars = maxContracts * riskPerContract;
  const actualRiskPercent = (actualRiskDollars / MICRO_BASELINE) * 100;

  // $500 -> $2,500 simulation, one row per tier at its representative rate.
  const simRows = RISK_TIERS.map((t) => {
    const weeks = Math.ceil(weeksToMultiply(SIM_MULTIPLE, t.exampleWeeklyRate));
    const final = balanceAtWeek(weeks, t.exampleWeeklyRate, MICRO_BASELINE);
    return { tier: t, weeks, final };
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Risk Tiering Matrix */}
      <div className="grid gap-3 sm:grid-cols-3">
        {RISK_TIERS.map((t) => {
          const active = t.key === activeTier.key;
          return (
            <div
              key={t.key}
              className={`rounded-xl border p-4 transition-all ${TONE_CLASSES[t.tone]} ${
                active ? TONE_RING[t.tone] : "opacity-60"
              }`}
            >
              <h3 className={`text-sm font-semibold uppercase tracking-wide ${TONE_TEXT[t.tone]}`}>{t.label}</h3>
              <p className="mt-1 text-xs text-white/50">
                {t.weeklyMin}%–{t.weeklyMax ? `${t.weeklyMax}%` : "150%+"} weekly compounding
              </p>
              <p className="mt-2 font-mono text-lg text-white">
                {t.riskMin}–{t.riskMax}% <span className="text-xs font-sans text-white/40">max risk / trade</span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/60">{t.structureNote}</p>
            </div>
          );
        })}
      </div>

      {/* Try your own rate */}
      <div className="rounded border border-white/10 bg-white/5 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Try Your Own Rate</h3>
        <div className="mt-3 flex items-center gap-4">
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={weeklyRate}
            onChange={(e) => setWeeklyRate(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <span className="w-20 flex-none text-right font-mono text-sm text-white">
            {weeklyRate}
            {weeklyRate >= 150 ? "%+" : "%"}
          </span>
        </div>
        <p className={`mt-3 text-sm ${TONE_TEXT[activeTier.tone]}`}>
          {weeklyRate}% weekly lands you in the <span className="font-semibold">{activeTier.label}</span> tier — max
          account risk per trade around{" "}
          <span className="font-mono font-semibold">{riskPercent.toFixed(1)}%</span>.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/50">
          Slower and steadier fits you better? Stay Conservative and lean on the structure rules in{" "}
          <a href="/playbook/exits" className="underline hover:text-white/70">
            Adjusting Exits
          </a>
          . Chasing the Aggressive Sprint tier's 15–22%? That's built for shorter-dated, high-velocity contracts —
          re-read Zero Averaging Down / Zero Revenge Trading on the{" "}
          <a href="/playbook/exits" className="underline hover:text-white/70">
            Exits &amp; Psychology page
          </a>{" "}
          before you size up that far.
        </p>
      </div>

      {/* Micro-account math breakdown */}
      <div className="rounded-xl border border-white/10 bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
          Micro-Account Math — ${MICRO_BASELINE} Baseline
        </h3>
        <p className="mt-1 text-xs text-white/50">Worked example at a {workedRiskPercent}% Moderate-tier risk ceiling.</p>
        <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <Row label="Account balance" value={money(MICRO_BASELINE)} />
          <Row label="60% deployable / 40% idle" value={`${money(allocation60)} / ${money(idle40)}`} />
          <Row label={`Max allowed risk (${workedRiskPercent}%)`} value={money(workedMaxRisk)} />
          <Row label="Sample entry premium" value={`$${sampleEntryPremium.toFixed(2)}`} />
          <Row label="-40% structural stop premium" value={`$${sampleStopPremium.toFixed(2)}`} />
          <Row label="Risk per contract" value={money(riskPerContract)} />
          <Row label="Max contracts allowed" value={`${maxContracts}`} />
          <Row label="Actual account risk realized" value={`${actualRiskPercent.toFixed(1)}%`} highlight />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/50">
          The {workedRiskPercent}% figure is the ceiling the Risk Manager step allows — whole-contract rounding
          usually lands the <em>actual</em> risk a little under it, exactly like this example ({actualRiskPercent.toFixed(1)}
          % realized vs. a {workedRiskPercent}% ceiling).
        </p>
      </div>

      {/* $500 -> $2,500 simulation */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
          ${MICRO_BASELINE} → ${SIM_TARGET.toLocaleString()} Simulation, by Tier
        </h3>
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-white/50">
              <tr>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Tier</th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Weekly Rate</th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Weeks to $2,500</th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Final Balance</th>
              </tr>
            </thead>
            <tbody>
              {simRows.map((r) => (
                <tr key={r.tier.key} className="border-t border-white/10">
                  <td className={`px-3 py-2 font-medium ${TONE_TEXT[r.tier.tone]}`}>{r.tier.shortLabel}</td>
                  <td className="px-3 py-2 font-mono text-white/70">{r.tier.exampleWeeklyRate}% Weekly</td>
                  <td className="px-3 py-2 text-white/70">{r.weeks} Weeks</td>
                  <td className="px-3 py-2 font-mono font-medium text-accent">{money(r.final)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/50">
          Same simplified constant-rate model as the $250 → $100K illustration further down this page — no losing
          weeks, not the actual trade-by-trade enforcement (that's the Twelve-Stage roadmap below). Real weekly
          returns vary; hypothetical performance never guarantees future results (CFTC Rule 4.41).
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-1.5">
      <span className="text-white/60">{label}</span>
      <span className={`font-mono ${highlight ? "font-semibold text-accent" : "text-white"}`}>{value}</span>
    </div>
  );
}
