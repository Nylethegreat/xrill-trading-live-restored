"use client";

import { useState } from "react";
import Link from "next/link";
import { AFTER_FACT_REASONS } from "@/lib/afterFact";
import { evaluateRisk, evaluateTradePlan, OPTIONS_CONTRACT_MULTIPLIER, type OptionType, type StopMode } from "@/lib/xrill";
import { evaluateStructure, type Leg, type Structure } from "@/lib/structures";
import { DEFAULT_STOP_PERCENT, clampRiskPercent } from "@/lib/riskProfile";
import StructurePicker from "@/components/session/StructurePicker";
import { submitAfterFactSession } from "@/app/session/actions";

// EMERGENCY path: the trade is already on and the gates were skipped.
// This does not authorize anything -- it gets the trade on record (Trade
// Plan + Risk Manager only) so it can be tracked, trimmed, closed and
// journaled like any other position, flagged "Logged After".

const inputClass = "w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-loss";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/60">{label}</span>
      {children}
    </label>
  );
}

const money = (v: number) => `$${v.toFixed(2)}`;

export default function AfterFactLog({
  accountBalance,
  riskPercent: rawRiskPercent,
  stopPercent = DEFAULT_STOP_PERCENT,
}: {
  accountBalance: number;
  riskPercent: number;
  stopPercent?: number;
}) {
  const riskPercent = clampRiskPercent(rawRiskPercent);
  const [acknowledged, setAcknowledged] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [other, setOther] = useState("");

  const [structure, setStructure] = useState<Structure>("single");
  const [legs, setLegs] = useState<Leg[]>([]);
  const [ticker, setTicker] = useState("");
  const [optionType, setOptionType] = useState<OptionType>("CALL");
  const [entry, setEntry] = useState("");
  const [stopMode, setStopMode] = useState<StopMode>("PRICE");
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [contracts, setContracts] = useState("1");
  const [strike, setStrike] = useState("");
  const [expiration, setExpiration] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ warnings: string[] } | null>(null);

  const structureResult = evaluateStructure(structure, legs);
  const entryNum = structure === "single" ? parseFloat(entry) : structureResult.netDebit ?? NaN;
  const n = parseInt(contracts, 10);

  const planInput = {
    ticker,
    optionType,
    entryPremium: entryNum,
    stopMode,
    stopPremium: stopMode === "PRICE" ? parseFloat(stop) : undefined,
    targetPremium: parseFloat(target),
    contracts: n,
    maxValue: structureResult.width,
  };
  const plan = structure !== "single" && !structureResult.valid ? null : evaluateTradePlan(planInput);
  const risk =
    plan && plan.valid
      ? evaluateRisk(plan.tradeRisk!, n, accountBalance, riskPercent, plan.totalOutlay!, stopPercent)
      : null;

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-4xl">📝</p>
        <h1 className="mt-3 font-mono text-xl font-bold tracking-widest text-white">TRADE ON RECORD</h1>
        <p className="mt-2 text-sm text-white/60">
          Logged as <span className="font-semibold text-loss">Logged After</span>. It&apos;s an open position now: trim it, close it and
          journal it like any other trade. It doesn&apos;t count toward your streak or authorization rate.
        </p>
        {done.warnings.length > 0 && (
          <div className="mx-auto mt-4 max-w-md rounded border border-loss/40 bg-loss/10 p-3 text-left text-xs text-loss">
            <p className="font-semibold">Rules this trade broke:</p>
            <ul className="mt-1 list-disc pl-4">
              {done.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link href="/journal" className="rounded bg-loss px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            Add a screenshot in the Journal →
          </Link>
          <Link href="/dashboard" className="text-sm text-white/50 underline hover:text-white/70">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Big red warning */}
      <div className="rounded-lg border-2 border-loss bg-loss/10 p-5 shadow-[0_0_30px_-6px_rgba(239,68,68,0.7)]">
        <div className="flex items-start gap-3">
          <span className="text-4xl leading-none motion-safe:animate-pulse" aria-hidden="true">
            🚨
          </span>
          <div>
            <h1 className="font-mono text-lg font-bold tracking-widest text-loss">EMERGENCY LOG: TRADE ALREADY TAKEN</h1>
            <p className="mt-2 text-sm text-white/80">
              You are <span className="font-bold text-loss">not supposed to trade without running XRILL first.</span> The gates exist
              to stop exactly this.
            </p>
            <p className="mt-2 text-sm text-white/70">
              But it happened, and a trade on record beats a trade you pretend didn&apos;t happen. This skips straight to the Trade
              Plan and Risk Manager so you can still track, trim, close and journal it. It will be flagged{" "}
              <span className="font-semibold text-loss">Logged After</span> and will <span className="font-semibold">not</span> count
              as an authorized trade.
            </p>
          </div>
        </div>
        {!acknowledged && (
          <button
            type="button"
            onClick={() => setAcknowledged(true)}
            className="mt-4 w-full rounded bg-loss px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
          >
            I understand. Log it anyway.
          </button>
        )}
      </div>

      {acknowledged && (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-white">Why wasn&apos;t it logged first?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {AFTER_FACT_REASONS.map((r) => {
                const on = reasons.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setReasons(on ? reasons.filter((x) => x !== r) : [...reasons, r])}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      on ? "border-loss bg-loss/20 text-red-200" : "border-white/20 text-white/60 hover:text-white"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {r}
                  </button>
                );
              })}
            </div>
            <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Other reason (optional)" className={`${inputClass} mt-2`} />
          </div>

          <div className="space-y-3 rounded border border-white/10 bg-surface p-4">
            <p className="text-sm font-semibold text-white">Trade Plan (what you actually entered)</p>
            <Field label="Ticker">
              <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="SPY" className={inputClass} />
            </Field>
            <Field label="Position Structure">
              <StructurePicker
                structure={structure}
                legs={legs}
                optionType={optionType}
                onChange={(next) => {
                  setStructure(next.structure);
                  setLegs(next.legs);
                  if (next.structure === "vertical" && next.legs[0]) setOptionType(next.legs[0].type);
                }}
              />
            </Field>
            {structure === "single" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Option Type">
                  <div className="flex gap-2">
                    {(["CALL", "PUT"] as OptionType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setOptionType(t)}
                        className={`flex-1 rounded px-3 py-2 text-sm ${optionType === t ? "bg-white text-black" : "border border-white/20 text-white/60"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Strike (optional)">
                  <input type="number" step="any" value={strike} onChange={(e) => setStrike(e.target.value)} className={inputClass} />
                </Field>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label={structure === "single" ? "Premium paid" : "Net debit (from legs)"}>
                {structure === "single" ? (
                  <input type="number" step="any" value={entry} onChange={(e) => setEntry(e.target.value)} className={inputClass} />
                ) : (
                  <div className="rounded border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white/80">
                    {Number.isFinite(entryNum) ? money(entryNum) : "—"}
                  </div>
                )}
              </Field>
              <Field label="Expiration (optional)">
                <input type="date" value={expiration} onChange={(e) => setExpiration(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
              </Field>
            </div>
            <Field label="Stop">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStopMode("PRICE")}
                  className={`rounded px-3 py-1.5 text-xs ${stopMode === "PRICE" ? "bg-white text-black" : "border border-white/20 text-white/60"}`}
                >
                  Stop price
                </button>
                <button
                  type="button"
                  onClick={() => setStopMode("ZERO_OUT")}
                  className={`rounded px-3 py-1.5 text-xs ${stopMode === "ZERO_OUT" ? "bg-white text-black" : "border border-white/20 text-white/60"}`}
                >
                  Full premium at risk
                </button>
              </div>
              {stopMode === "PRICE" && (
                <input type="number" step="any" value={stop} onChange={(e) => setStop(e.target.value)} placeholder="Exit if it drops to..." className={`${inputClass} mt-2`} />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target">
                <input type="number" step="any" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} />
              </Field>
              <Field label={structure === "single" ? "Contracts" : "Number of spreads"}>
                <input type="number" min={1} step={1} value={contracts} onChange={(e) => setContracts(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>

          {/* Risk Manager readout -- informational: the trade is already on */}
          <div className="rounded border border-white/10 bg-surface p-4 font-mono text-xs">
            <p className="mb-2 font-sans text-sm font-semibold text-white">Risk Manager</p>
            {!plan ? (
              <p className="font-sans text-caution">{structureResult.error ?? "Fill in the plan above."}</p>
            ) : !plan.valid ? (
              <p className="font-sans text-caution">{plan.error}</p>
            ) : (
              <div className="space-y-1">
                <Row
                  label="Total risk"
                  value={`${money(plan.tradeRisk!)} (${money(plan.riskPerContract!)}/${structure === "single" ? "contract" : "spread"} × ${n})`}
                />
                <Row label="Your max risk per trade" value={`${money(risk!.maxRisk)} (${riskPercent}%)`} />
                <Row label="Capital used" value={`${money(plan.totalOutlay!)} of ${money(risk!.activeSleeve)} Active Sleeve`} />
                <Row label="R:R" value={plan.rr!.toFixed(2)} tone={plan.passed ? "text-accent" : "text-caution"} />
                <Row
                  label="Within your rules?"
                  value={risk!.passed && plan.passed ? "YES" : "NO — this will be noted on the trade"}
                  tone={risk!.passed && plan.passed ? "text-accent" : "text-loss"}
                />
                <p className="pt-1 font-sans text-[11px] text-white/40">
                  1 contract controls {OPTIONS_CONTRACT_MULTIPLIER} shares. Nothing here blocks the log, the trade already exists.
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-blocked">{error}</p>}

          <button
            type="button"
            disabled={submitting || !plan || !plan.valid || (reasons.length === 0 && !other.trim())}
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              const res = await submitAfterFactSession({
                reasons,
                otherReason: other,
                plan: {
                  ticker,
                  optionType,
                  entryPremium: entryNum,
                  stopMode,
                  stopPremium: stopMode === "PRICE" ? parseFloat(stop) : undefined,
                  targetPremium: parseFloat(target),
                  contracts: n,
                  strike: structure === "single" && strike ? parseFloat(strike) : null,
                  expiration: expiration || null,
                  structure,
                  legs: structure === "single" ? null : legs,
                },
              });
              setSubmitting(false);
              if (!res.success) return setError(res.error ?? "Something went wrong.");
              setDone({ warnings: res.warnings ?? [] });
            }}
            className="w-full rounded-lg bg-loss px-4 py-3 text-base font-bold tracking-wide text-white shadow-[0_0_20px_4px_rgba(239,68,68,0.45)] disabled:opacity-40"
          >
            {submitting ? "Logging..." : "🚨 Log This Trade (Logged After)"}
          </button>
          {reasons.length === 0 && !other.trim() && (
            <p className="text-center text-xs text-white/40">Pick at least one reason above first.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, tone = "text-white/80" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/50">{label}</span>
      <span className={`text-right ${tone}`}>{value}</span>
    </div>
  );
}
