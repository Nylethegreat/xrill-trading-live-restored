"use client";

import { useState } from "react";
import Link from "next/link";
import { RISK_TIERS, type RiskTier } from "@/lib/data/riskTiers";

// A quick gut-check gate in front of the full XRILL session wizard. It's
// intentionally separate from (and lighter than) the wizard's own Daily
// Check-In / Trade Gate / Execution Check gates — this is the "before you
// even open the wizard" pass, not a replacement for the real thing.
//
// The "Max risk" item used to be a flat, hardcoded "2-5%" line. It's now
// driven by the same Dynamic Risk Tiering Matrix on the Playbook page
// (/playbook#risk-tiering) — pick your pace tier here and the ceiling
// updates to match, instead of pretending everyone trades the same way.
export default function PreTradeChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [tierKey, setTierKey] = useState<RiskTier["key"]>("conservative");

  const tier = RISK_TIERS.find((t) => t.key === tierKey)!;

  const ITEMS = [
    { key: "risk", label: `Max risk is ${tier.riskMin}–${tier.riskMax}% of account or less (${tier.label})` },
    { key: "stop", label: "Hard stop is already set" },
    { key: "setup", label: "Setup criteria confirmed" },
    { key: "revenge", label: "Zero revenge trading, zero averaging down — this isn't chasing a loss" },
  ] as const;

  const allChecked = ITEMS.every((item) => checked[item.key]);

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="rounded border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Pre-Trade Checklist</h2>

      <div className="mt-3">
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-white/40">Pace Tier</p>
        <div className="flex gap-1.5">
          {RISK_TIERS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTierKey(t.key)}
              className={`flex-1 rounded border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                tierKey === t.key
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/10 text-white/50 hover:border-white/25"
              }`}
            >
              {t.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {ITEMS.map((item) => {
          const isChecked = !!checked[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className={`flex w-full items-center gap-3 rounded border p-2.5 text-left text-sm transition-colors ${
                isChecked ? "border-accent bg-accent/10 text-white" : "border-white/10 text-white/70 hover:border-white/25"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                  isChecked ? "border-accent bg-accent text-black" : "border-white/30 text-transparent"
                }`}
              >
                ✓
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-wide text-blocked">
        Zero Averaging Down. Zero Revenge Trading. Accept the stop and walk away.
      </p>
      <p className="mt-1 text-center text-[11px] text-white/40">
        <Link href="/playbook#risk-tiering" className="underline hover:text-white/70">
          See the full Dynamic Risk Tiering Matrix →
        </Link>
      </p>

      {allChecked ? (
        <Link
          href="/session"
          className="mt-4 block rounded bg-accent px-4 py-2 text-center text-sm font-medium text-black hover:opacity-90"
        >
          🚀 Start XRILL Session
        </Link>
      ) : (
        <div
          aria-disabled="true"
          className="mt-4 cursor-not-allowed rounded bg-white/10 px-4 py-2 text-center text-sm font-medium text-white/40"
        >
          🚀 Start XRILL Session — check all 4 items first
        </div>
      )}
    </div>
  );
}
