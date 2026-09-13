"use client";

import { useState } from "react";
import { PROP_TIERS, PROP_PHASES, PREMARKET_CHECKLIST, shutdownRules, type PropTier } from "@/lib/data/propFirm";

function money(v: number) {
  return `$${Math.abs(v).toLocaleString()}`;
}

export default function PropFirmTiers() {
  const [tierIdx, setTierIdx] = useState(0);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const tier: PropTier = PROP_TIERS[tierIdx];
  const activePhase = PROP_PHASES.find((p) => p.phase === phase)!;

  return (
    <div>
      {/* Tier selector */}
      <div className="flex flex-wrap gap-2">
        {PROP_TIERS.map((t, i) => (
          <button
            key={t.size}
            type="button"
            onClick={() => setTierIdx(i)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              i === tierIdx ? "border-accent bg-accent/15 text-accent" : "border-white/20 text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Parameters table */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ParamCard label="Profit Target" value={`+${money(tier.profitTarget)}`} tone="good" />
        <ParamCard label="Max Loss Limit" value={`-${money(tier.maxLossLimit)}`} tone="blocked" />
        <ParamCard label="50% Consistency Cap" value={money(tier.consistencyCap)} tone="caution" />
        <ParamCard label="Daily Hard Stop" value={`${tier.dailyHardStop}`} tone="blocked" />
      </div>
      <div className="mt-3 rounded border border-white/10 bg-surface p-3 text-sm text-white/70">
        <span className="font-semibold text-white">Target Sizing: </span>
        {tier.sizing}
      </div>

      {/* Execution phase tabs */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Execution Breakdown</h3>
        <div className="mt-2 flex gap-1.5">
          {PROP_PHASES.map((p) => (
            <button
              key={p.phase}
              type="button"
              onClick={() => setPhase(p.phase)}
              className={`rounded px-3 py-1.5 text-xs font-medium ${
                phase === p.phase ? "bg-primary text-white" : "border border-white/20 text-white/60 hover:text-white"
              }`}
            >
              Phase {p.phase}: {p.title}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded border border-white/10 bg-surface p-4">
          <h4 className="text-sm font-semibold text-white">
            Phase {activePhase.phase}: {activePhase.title}
          </h4>
          <ul className="mt-2 space-y-2 text-sm text-white/70">
            {activePhase.points.map((pt, i) => (
              <li key={i} className="border-l-2 border-primary/40 pl-3">{pt}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Pre-Market Checklist</h3>
          <ul className="space-y-1.5 text-sm text-white/70">
            {PREMARKET_CHECKLIST.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-white/30">☐</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Shutdown Rules (Mandatory)</h3>
          <ul className="space-y-1.5 text-sm text-white/70">
            {shutdownRules(tier).map((c, i) => (
              <li key={i} className="rounded border border-blocked/30 bg-blocked/10 p-2 text-white/80">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ParamCard({ label, value, tone }: { label: string; value: string; tone: "good" | "blocked" | "caution" }) {
  const toneText = { good: "text-accent", blocked: "text-blocked", caution: "text-caution" }[tone];
  return (
    <div className="rounded border border-white/10 bg-surface p-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className={`mt-1 text-lg font-bold ${toneText}`}>{value}</div>
    </div>
  );
}
