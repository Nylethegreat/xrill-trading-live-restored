"use client";

import type { OptionType } from "@/lib/xrill";
import { STRUCTURE_LABELS, defaultLegs, evaluateStructure, type Leg, type Structure } from "@/lib/structures";

// Trade Plan control for "what am I buying": a single option, a vertical
// debit spread, or a straddle/strangle. For multi-leg structures the user
// enters each leg's strike and premium; the net debit is calculated here
// and pushed back up as the plan's entry premium, so the Risk Manager
// sizes the whole structure as ONE position.

const inputClass = "w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent";

function numOrBlank(v: number) {
  return Number.isFinite(v) ? String(v) : "";
}

export default function StructurePicker({
  structure,
  legs,
  optionType,
  onChange,
}: {
  structure: Structure;
  legs: Leg[];
  optionType: OptionType;
  onChange: (next: { structure: Structure; legs: Leg[]; netDebit: number | null }) => void;
}) {
  const result = evaluateStructure(structure, legs);

  function emit(nextStructure: Structure, nextLegs: Leg[]) {
    const r = evaluateStructure(nextStructure, nextLegs);
    onChange({ structure: nextStructure, legs: nextLegs, netDebit: r.valid && r.netDebit !== undefined ? r.netDebit : null });
  }

  function updateLeg(i: number, patch: Partial<Leg>) {
    const next = legs.map((l, j) => (j === i ? { ...l, ...patch } : l));
    // keep a vertical's two legs the same option type
    if (structure === "vertical" && patch.type) next.forEach((l) => (l.type = patch.type!));
    emit(structure, next);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STRUCTURE_LABELS) as Structure[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => emit(s, defaultLegs(s, optionType))}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              structure === s ? "bg-accent text-black" : "border border-white/20 text-white/60 hover:text-white"
            }`}
          >
            {STRUCTURE_LABELS[s]}
          </button>
        ))}
      </div>

      {structure !== "single" && (
        <div className="rounded border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-[11px] text-white/50">
            {structure === "vertical"
              ? "Debit spread: buy one strike, sell another (same type and expiration). Counts as ONE position; contracts = number of spreads."
              : "Buy a call and a put. Same strike = straddle, different strikes = strangle. Counts as ONE position."}
          </p>
          <div className="space-y-2">
            {legs.map((leg, i) => (
              <div key={i} className="grid grid-cols-[auto_auto_1fr_1fr] items-end gap-2">
                <span
                  className={`rounded px-2 py-1.5 text-[11px] font-bold ${
                    leg.side === "BUY" ? "bg-accent/15 text-accent" : "bg-loss/15 text-loss"
                  }`}
                >
                  {leg.side}
                </span>
                {structure === "vertical" ? (
                  <select
                    value={leg.type}
                    onChange={(e) => updateLeg(i, { type: e.target.value as OptionType })}
                    className="rounded border border-white/20 bg-background px-2 py-1.5 text-sm"
                  >
                    <option value="CALL">CALL</option>
                    <option value="PUT">PUT</option>
                  </select>
                ) : (
                  <span className="px-2 py-1.5 text-sm text-white/70">{leg.type}</span>
                )}
                <label className="block">
                  <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-white/40">Strike</span>
                  <input
                    type="number"
                    step="any"
                    value={numOrBlank(leg.strike)}
                    onChange={(e) => updateLeg(i, { strike: e.target.value === "" ? NaN : parseFloat(e.target.value) })}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-white/40">
                    {leg.side === "BUY" ? "Premium paid" : "Premium received"}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={numOrBlank(leg.premium)}
                    onChange={(e) => updateLeg(i, { premium: e.target.value === "" ? NaN : parseFloat(e.target.value) })}
                    className={inputClass}
                  />
                </label>
              </div>
            ))}
          </div>
          {result.valid && result.netDebit !== undefined ? (
            <p className="mt-2 font-mono text-xs text-accent">
              Net debit ${result.netDebit.toFixed(2)} = ${(result.netDebit * 100).toFixed(2)} per {structure === "vertical" ? "spread" : "pair"}
              {result.width !== undefined && ` · max value $${result.width.toFixed(2)} (strike width)`}
            </p>
          ) : (
            <p className="mt-2 text-xs text-caution">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
