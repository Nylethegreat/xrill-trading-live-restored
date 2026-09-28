"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AllocationWall from "@/components/session/AllocationWall";
import Badge from "@/components/Badge";
import {
  scoreFastTradeGate,
  scoreSetup,
  evaluateTradePlan,
  evaluateRisk,
  calculateMaxRisk,
  scoreExecution,
  OPTIONS_CONTRACT_MULTIPLIER,
  ACTIVE_SLEEVE_PERCENT,
  type OptionType,
  type StopMode,
} from "@/lib/xrill";
import { submitFastSession } from "@/app/session/actions";
import Hint from "./Hint";

// The Daytrade Engine -- a 4-step fast pass through the same underlying
// gates.ts/lib/xrill.ts math as the standard 8-gate wizard (XrillWizard.tsx,
// left completely untouched), for someone who wants speed on a riskier,
// faster-moving daytrade instead of the full readiness pipeline. Neon
// cyan ("daytrade" token, tailwind.config.ts) throughout instead of the
// traditional green, so it's never visually confused with the standard
// engine. See lib/xrill.ts's scoreFastTradeGate/evaluateFastAuthorization
// for exactly what's trimmed and why.
type Step = "beware" | "gate" | "setup" | "plan" | "risk" | "execution" | "result" | "blocked";

const FAST_STEPS = [
  { key: "gate", label: "Trade\nGate" },
  { key: "setup", label: "Setup\nRead" },
  { key: "plan", label: "Trade\nPlan" },
  { key: "risk", label: "Risk\nManager" },
  { key: "execution", label: "Execution\nCheck" },
] as const;

function FastStepTracker({ current }: { current: string }) {
  const currentIndex = FAST_STEPS.findIndex((s) => s.key === current);
  const activeIndex = currentIndex === -1 ? FAST_STEPS.length - 1 : currentIndex;

  return (
    <div className="mb-8 flex items-start justify-between overflow-x-auto pb-2">
      {FAST_STEPS.map((step, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
        return (
          <div key={step.key} className="flex flex-1 items-start">
            <div className="flex flex-col items-center gap-1.5 px-1">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  state === "done"
                    ? "border-daytrade bg-daytrade/20 text-daytrade"
                    : state === "active"
                    ? "border-daytrade bg-daytrade/20 text-daytrade shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                    : "border-white/15 bg-white/5 text-white/40"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </div>
              <span className="whitespace-pre-line text-center text-[10px] leading-tight text-white/50">
                {step.label}
              </span>
            </div>
            {i < FAST_STEPS.length - 1 && (
              <div className={`mt-4 h-0.5 flex-1 ${i < activeIndex ? "bg-daytrade/50" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function YesNo({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="border-b border-white/10 py-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-white/80">
          {label}
          {hint && <Hint text={hint} />}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`rounded px-3 py-1 text-sm ${
              value === true ? "bg-daytrade text-black" : "border border-white/20 text-white/60"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`rounded px-3 py-1 text-sm ${
              value === false ? "bg-loss text-white" : "border border-white/20 text-white/60"
            }`}
          >
            No
          </button>
        </div>
      </div>
      {value !== null && (
        <div
          className="mt-2 h-[3px] w-full rounded-full motion-safe:animate-vein-flow"
          style={{
            backgroundImage: "linear-gradient(90deg, #a855f7, #f97316, #a855f7, #f97316)",
            backgroundSize: "200% 100%",
            boxShadow: "0 0 6px 1px rgba(249,115,22,0.4)",
          }}
        />
      )}
    </div>
  );
}

function CheckItem({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-3 rounded border p-3 text-left transition-colors ${
        checked ? "border-daytrade bg-daytrade/10" : "border-white/10 bg-surface hover:border-white/25"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
          checked ? "border-daytrade bg-daytrade text-black" : "border-white/30 text-transparent"
        }`}
      >
        ✓
      </span>
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="block text-xs text-white/50">{detail}</span>
      </span>
    </button>
  );
}

export default function XrillFastWizard({
  accountBalance,
  riskPercent,
}: {
  accountBalance: number;
  riskPercent: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("beware");
  const [blockedReason, setBlockedReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [gate, setGate] = useState({
    mentallyAllowed: null as boolean | null,
    liquidity: null as boolean | null,
  });

  const [setup, setSetup] = useState({
    trendAlignment: false,
    keyLevelReaction: false,
    momentumVolume: false,
    newsClear: false,
    riskReward: false,
  });

  const [plan, setPlan] = useState({
    ticker: "",
    optionType: "CALL" as OptionType,
    entryPremium: "",
    stopMode: "PRICE" as StopMode,
    stopPremium: "",
    targetPremium: "",
    contracts: "1",
  });
  const [planResult, setPlanResult] = useState<ReturnType<typeof evaluateTradePlan> | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  const [execution, setExecution] = useState({
    confirmation: null as boolean | null,
    plannedEntry: null as boolean | null,
    stopReady: null as boolean | null,
    riskLimit: null as boolean | null,
    emotional: null as boolean | null,
  });

  const [result, setResult] = useState<{ authorized: boolean; rejectionReason: string | null } | null>(null);

  if (step === "beware") {
    return (
      <Shell title="⚡ Daytrade Engine" accountBalance={accountBalance}>
        <div className="rounded border border-daytrade/40 bg-daytrade/5 p-4 motion-safe:animate-daytrade-glow">
          <p className="text-sm font-semibold uppercase tracking-wide text-daytrade">⚠️ Beware before entering</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            This is the fast pass — 4 steps instead of 8, and a trimmed 2-question Trade Gate instead of 5. No Daily
            Check-In. But Setup Read still requires 20/25 (4 of 5) to continue, same threshold as the standard
            engine — speed doesn't mean a free pass on confluence.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Trade Plan (R:R ≥ 2.0), Risk Manager, and Execution Check are exactly the same hard requirements as the
            standard engine — this isn't a way around your risk limits, just around the questions that cost you
            time on a fast-moving daytrade.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep("gate")}
          className="mt-6 w-full rounded bg-daytrade px-4 py-2 text-sm font-medium text-black hover:opacity-90"
        >
          I understand the risks — continue
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-2 w-full rounded border border-white/15 px-4 py-2 text-sm text-white/50 hover:text-white/80"
        >
          Back to Dashboard
        </button>
      </Shell>
    );
  }

  if (step === "gate") {
    const gateValues = Object.values(gate);
    const allAnswered = gateValues.every((v) => v !== null);
    return (
      <Shell title="Step 1/4 — Trade Gate (Fast)" step="gate" accountBalance={accountBalance}>
        <YesNo
          label="Psychologically allowed to trade?"
          value={gate.mentallyAllowed}
          onChange={(v) => setGate({ ...gate, mentallyAllowed: v })}
        />
        <YesNo
          label="Is liquidity acceptable?"
          hint="Low liquidity can be dangerous on a fast daytrade unless you're careful — wide spreads and thin order books can eat your edge, or trap you in a position, before you even realize it."
          value={gate.liquidity}
          onChange={(v) => setGate({ ...gate, liquidity: v })}
        />
        <NextButton
          disabled={!allAnswered}
          onClick={() => {
            const r = scoreFastTradeGate(gate as any);
            if (!r.passed) {
              setBlockedReason(`Trade Gate: ${r.score}/2 — STATUS: ${r.status}. Session not logged.`);
              setStep("blocked");
            } else {
              setStep("setup");
            }
          }}
        />
      </Shell>
    );
  }

  if (step === "setup") {
    const total =
      (setup.trendAlignment ? 5 : 0) +
      (setup.keyLevelReaction ? 5 : 0) +
      (setup.momentumVolume ? 5 : 0) +
      (setup.newsClear ? 5 : 0) +
      (setup.riskReward ? 5 : 0);
    const badge = total >= 25 ? { text: "A+ SETUP", tone: "good" as const } : total >= 20 ? { text: "GOOD SETUP", tone: "good" as const } : { text: "BLOCKED", tone: "blocked" as const };

    return (
      <Shell title="Step 2/4 — Setup Read" step="setup" accountBalance={accountBalance}>
        <p className="mb-3 text-xs text-white/50">
          Same 20/25 (4 of 5) threshold as the standard engine — speed isn't a free pass on confluence.
        </p>
        <div className="space-y-2">
          <CheckItem
            label="Trend Alignment"
            detail="Is price trading above the 9/21 EMA for Calls, or below for Puts?"
            checked={setup.trendAlignment}
            onChange={(v) => setSetup({ ...setup, trendAlignment: v })}
          />
          <CheckItem
            label="Key Level Reaction"
            detail="Did price reject or bounce from a clear Support/Resistance, VWAP, or Pre-Market level?"
            checked={setup.keyLevelReaction}
            onChange={(v) => setSetup({ ...setup, keyLevelReaction: v })}
          />
          <CheckItem
            label="Momentum & Volume"
            detail="Is there clean volume expansion on the entry candle?"
            checked={setup.momentumVolume}
            onChange={(v) => setSetup({ ...setup, momentumVolume: v })}
          />
          <CheckItem
            label="News & Event Clear"
            detail="No high-impact macro reports (CPI, FOMC) or earnings scheduled in the next 30 minutes?"
            checked={setup.newsClear}
            onChange={(v) => setSetup({ ...setup, newsClear: v })}
          />
          <CheckItem
            label="Risk-to-Reward"
            detail="Does the profit target offer at least 2x your defined stop loss?"
            checked={setup.riskReward}
            onChange={(v) => setSetup({ ...setup, riskReward: v })}
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2">
          <span className="font-mono text-sm text-white">{total}/25</span>
          <Badge tone={badge.tone}>{badge.text}</Badge>
        </div>

        <NextButton
          onClick={() => {
            const r = scoreSetup(setup);
            if (!r.passed) {
              setBlockedReason(`Setup Score: ${r.total}/25 — GRADE: ${r.grade}. Session not logged.`);
              setStep("blocked");
            } else {
              setStep("plan");
            }
          }}
        />
      </Shell>
    );
  }

  if (step === "plan") {
    const entry = parseFloat(plan.entryPremium);
    const stop = plan.stopMode === "ZERO_OUT" ? 0 : parseFloat(plan.stopPremium);
    const target = parseFloat(plan.targetPremium);
    const contracts = parseInt(plan.contracts, 10) || 0;

    const hasEntry = !Number.isNaN(entry) && entry > 0;
    const hasStop = plan.stopMode === "ZERO_OUT" || (!Number.isNaN(stop) && stop >= 0);
    const riskPerContract = hasEntry && hasStop && stop < entry ? (entry - stop) * OPTIONS_CONTRACT_MULTIPLIER : null;
    const rewardPerContract = hasEntry && !Number.isNaN(target) && target > entry ? (target - entry) * OPTIONS_CONTRACT_MULTIPLIER : null;
    const totalOutlay = hasEntry && contracts > 0 ? entry * OPTIONS_CONTRACT_MULTIPLIER * contracts : null;

    const maxRisk = calculateMaxRisk(accountBalance, riskPercent);
    const maxContractsByRisk = riskPerContract && riskPerContract > 0 ? Math.floor(maxRisk / riskPerContract) : null;
    // Cap by the deployable Active Sleeve (60% of balance) too -- a tight
    // stop alone can recommend more contracts than the account can afford
    // to buy. Same fix as the standard engine / lib/xrill.ts's evaluateRisk.
    const activeSleeve = accountBalance * ACTIVE_SLEEVE_PERCENT;
    const maxContractsByOutlay = hasEntry && entry > 0 ? Math.floor(activeSleeve / (entry * OPTIONS_CONTRACT_MULTIPLIER)) : null;
    const maxContracts =
      maxContractsByRisk !== null && maxContractsByOutlay !== null
        ? Math.min(maxContractsByRisk, maxContractsByOutlay)
        : maxContractsByRisk ?? maxContractsByOutlay;
    const exceedsMax = maxContracts !== null && contracts > maxContracts;

    return (
      <Shell title="Step 3/5 — Trade Plan" step="plan" accountBalance={accountBalance}>
        <div className="space-y-3">
          <Field label="Ticker">
            <input
              value={plan.ticker}
              onChange={(e) => setPlan({ ...plan, ticker: e.target.value.toUpperCase() })}
              placeholder="SPY, QQQ, NVDA, TSLA..."
              className="w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-daytrade"
            />
          </Field>

          <Field label="Option Type">
            <div className="flex gap-2">
              {(["CALL", "PUT"] as OptionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPlan({ ...plan, optionType: t })}
                  className={`flex-1 rounded px-3 py-2 text-sm ${
                    plan.optionType === t ? "bg-daytrade text-black" : "border border-white/20 text-white/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Contract Premium (buy price)">
            <NumberInput value={plan.entryPremium} onChange={(v) => setPlan({ ...plan, entryPremium: v })} />
            {hasEntry && contracts > 0 && (
              <p className="mt-1 text-xs text-white/40">
                1 contract = ${entry.toFixed(2)} × 100 = ${(entry * OPTIONS_CONTRACT_MULTIPLIER).toFixed(2)} per
                contract
                {totalOutlay !== null && ` · Total outlay for ${contracts}: $${totalOutlay.toFixed(2)}`}
              </p>
            )}
          </Field>

          <Field label="Stop / Invalidation Mode">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlan({ ...plan, stopMode: "PRICE" })}
                className={`flex-1 rounded px-3 py-2 text-sm ${
                  plan.stopMode === "PRICE" ? "bg-daytrade text-black" : "border border-white/20 text-white/60"
                }`}
              >
                Contract Stop-Loss Price
              </button>
              <button
                type="button"
                onClick={() => setPlan({ ...plan, stopMode: "ZERO_OUT" })}
                className={`flex-1 rounded px-3 py-2 text-sm ${
                  plan.stopMode === "ZERO_OUT" ? "bg-daytrade text-black" : "border border-white/20 text-white/60"
                }`}
              >
                Full Premium at Risk
              </button>
            </div>
            <p className="mt-1 text-xs text-white/40">
              {plan.stopMode === "ZERO_OUT"
                ? "Common for 0DTE/scalps — you're risking the entire premium if it expires worthless."
                : "Exit if the premium drops to your stop price."}
            </p>
          </Field>

          {plan.stopMode === "PRICE" && (
            <Field label="Stop premium">
              <NumberInput value={plan.stopPremium} onChange={(v) => setPlan({ ...plan, stopPremium: v })} />
              {riskPerContract !== null && (
                <p className="mt-1 text-xs text-white/40">Risk per contract: ${riskPerContract.toFixed(2)}</p>
              )}
            </Field>
          )}
          {plan.stopMode === "ZERO_OUT" && hasEntry && (
            <p className="text-xs text-white/40">Risk per contract: ${(entry * OPTIONS_CONTRACT_MULTIPLIER).toFixed(2)} (full premium)</p>
          )}

          <Field label="Target premium">
            <NumberInput value={plan.targetPremium} onChange={(v) => setPlan({ ...plan, targetPremium: v })} />
            {rewardPerContract !== null && (
              <p className="mt-1 text-xs text-white/40">Reward per contract: ${rewardPerContract.toFixed(2)}</p>
            )}
          </Field>

          <Field label="Contracts">
            <NumberInput value={plan.contracts} onChange={(v) => setPlan({ ...plan, contracts: v })} />
          </Field>

          {maxContracts !== null && (
            <p className={`text-xs ${exceedsMax ? "text-loss" : "text-white/40"}`}>
              Maximum allowed: {maxContracts} contract{maxContracts === 1 ? "" : "s"} — whichever is more restrictive
              of max risk (${maxRisk.toFixed(2)} at {riskPercent}%, {maxContractsByRisk} contracts) or your
              deployable Active Sleeve (${activeSleeve.toFixed(2)} at 60% of balance, {maxContractsByOutlay}{" "}
              contracts).
              {exceedsMax && (
                <>
                  {" "}
                  ⚠️ Exceeds max allowed of {maxContracts} contract{maxContracts === 1 ? "" : "s"}.
                </>
              )}
            </p>
          )}
        </div>

        {planError && <p className="mt-3 text-sm text-loss">{planError}</p>}

        <NextButton
          label="Evaluate Trade Plan"
          onClick={() => {
            const r = evaluateTradePlan({
              ticker: plan.ticker,
              optionType: plan.optionType,
              entryPremium: entry,
              stopMode: plan.stopMode,
              stopPremium: plan.stopMode === "PRICE" ? stop : undefined,
              targetPremium: target,
              contracts,
            });

            if (!r.valid) {
              setPlanError(r.error ?? "Invalid trade plan.");
              return;
            }

            setPlanError(null);
            setPlanResult(r);

            if (!r.passed) {
              setBlockedReason(`Trade Plan: R:R ${r.rr!.toFixed(2)} — minimum required is 2.00. Session not logged.`);
              setStep("blocked");
            } else {
              setStep("risk");
            }
          }}
        />
      </Shell>
    );
  }

  if (step === "risk" && planResult) {
    const contracts = parseInt(plan.contracts, 10);
    const risk = evaluateRisk(planResult.tradeRisk!, contracts, accountBalance, riskPercent, planResult.totalOutlay!);

    return (
      <Shell title="Step 4/5 — Risk Manager" step="risk" accountBalance={accountBalance}>
        <p className="mb-2 text-xs text-white/50">
          1 options contract controls 100 shares — every dollar amount below already accounts for that. Capped by
          whichever is more restrictive: your risk-per-trade % ceiling, or your deployable Active Sleeve (60% of
          balance) actually affording the contracts.
        </p>

        <div className="mb-3 rounded border border-daytrade/30 bg-daytrade/10 p-3 text-xs text-white/70">
          <p className="font-semibold text-daytrade">⚠️ Remember what you're actually risking</p>
          <p className="mt-1 font-mono">
            Premium paid: ${parseFloat(plan.entryPremium).toFixed(2)} · Stop-loss premium: $
            {planResult.effectiveStopPremium!.toFixed(2)} · Target premium: ${parseFloat(plan.targetPremium).toFixed(2)}
          </p>
          <p className="mt-1 text-white/50">
            A daytrade moves fast — confirm your actual broker ticket matches these premiums, per contract, before you place the order.
          </p>
        </div>

        <Row label="Account balance" value={`$${accountBalance.toLocaleString()}`} />
        <Row label="Risk per trade" value={`${riskPercent}%`} />
        <Row label="Maximum allowed risk" value={`$${risk.maxRisk.toFixed(2)}`} />
        <Row label="Trade risk" value={`$${planResult.tradeRisk!.toFixed(2)}`} />
        <Row label="Actual account risk" value={`${risk.actualRiskPercent.toFixed(2)}%`} />
        <Row label="Total premium outlay" value={`$${planResult.totalOutlay!.toFixed(2)}`} />
        <Row label="Deployable Active Sleeve (60%)" value={`$${risk.activeSleeve.toFixed(2)}`} />
        <Row label="Max contracts by risk" value={`${risk.maxContractsByRisk}`} />
        <Row label="Max contracts by outlay" value={`${risk.maxContractsByOutlay}`} />
        <Row label="Maximum contracts allowed" value={`${risk.maxContracts}`} />
        <Row
          label="Status"
          value={risk.passed ? "✅ APPROVED" : "❌ TOO LARGE"}
          highlight={risk.passed ? "good" : "bad"}
        />
        {!risk.passed && (
          <p className="mt-2 text-xs text-loss">
            ⚠️ Exceeds what your account can risk and/or afford. Reduce to {risk.maxContracts} contract
            {risk.maxContracts === 1 ? "" : "s"} on the previous step to qualify.
          </p>
        )}

        <NextButton
          onClick={() => {
            if (!risk.passed) {
              setBlockedReason("Risk Manager rejected the trade — reduce contracts or adjust the stop. Session not logged.");
              setStep("blocked");
            } else {
              setStep("execution");
            }
          }}
        />
      </Shell>
    );
  }

  if (step === "execution" && planResult) {
    const executionValues = Object.values(execution);
    const allAnswered = executionValues.every((v) => v !== null);

    return (
      <Shell title="Step 5/5 — Execution Check" step="execution" accountBalance={accountBalance}>
        <YesNo
          label="Did you wait for confirmation?"
          hint="Wait for the candle to close before acting — chasing a spike mid-candle is how you buy the top of the move instead of the start of it."
          value={execution.confirmation}
          onChange={(v) => setExecution({ ...execution, confirmation: v })}
        />
        <YesNo label="Entering at your planned level?" value={execution.plannedEntry} onChange={(v) => setExecution({ ...execution, plannedEntry: v })} />
        <YesNo label="Is your stop loss already placed?" value={execution.stopReady} onChange={(v) => setExecution({ ...execution, stopReady: v })} />
        <YesNo label="Within your daily loss limit?" value={execution.riskLimit} onChange={(v) => setExecution({ ...execution, riskLimit: v })} />
        <YesNo label="Trading the plan, not emotions?" value={execution.emotional} onChange={(v) => setExecution({ ...execution, emotional: v })} />

        {submitError && <p className="mt-3 text-sm text-loss">{submitError}</p>}

        <NextButton
          label={submitting ? "Submitting..." : "Finish Session"}
          disabled={!allAnswered || submitting}
          onClick={async () => {
            const r = scoreExecution(execution as any);
            if (!r.passed) {
              setBlockedReason(`Execution Check: ${r.score}/5 — STATUS: ${r.status}. Session not logged.`);
              setStep("blocked");
              return;
            }

            setSubmitting(true);
            setSubmitError(null);

            const res = await submitFastSession({
              gate: gate as any,
              setup,
              plan: {
                ticker: plan.ticker,
                optionType: plan.optionType,
                entryPremium: parseFloat(plan.entryPremium),
                stopMode: plan.stopMode,
                stopPremium: plan.stopMode === "PRICE" ? parseFloat(plan.stopPremium) : undefined,
                targetPremium: parseFloat(plan.targetPremium),
                contracts: parseInt(plan.contracts, 10),
              },
              execution: execution as any,
            });

            setSubmitting(false);

            if (!res.success) {
              setSubmitError(res.error ?? "Something went wrong.");
              return;
            }

            setResult({
              authorized: res.authorized!,
              rejectionReason: res.rejectionReason ?? null,
            });
            setStep("result");
          }}
        />
      </Shell>
    );
  }

  if (step === "blocked") {
    return (
      <Shell title="🟣 Session Blocked" accountBalance={accountBalance}>
        <p className="text-white/80">{blockedReason}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          Back to Dashboard
        </button>
      </Shell>
    );
  }

  if (step === "result" && result) {
    return (
      <Shell title={result.authorized ? "🟢 Trade Authorized" : "🟣 Trade Blocked"} accountBalance={accountBalance}>
        {!result.authorized && result.rejectionReason && (
          <Row label="Rejection reasons" value={result.rejectionReason} highlight="bad" />
        )}
        <p className="mt-4 text-sm text-white/60">
          {result.authorized
            ? "Daytrade Engine conditions satisfied. You are cleared to execute the trade."
            : "Do not execute this trade — conditions were not satisfied."}
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded bg-daytrade px-4 py-2 text-sm font-medium text-black hover:opacity-90"
        >
          Back to Dashboard
        </button>
      </Shell>
    );
  }

  return null;
}

function Shell({
  title,
  step,
  accountBalance,
  children,
}: {
  title: string;
  step?: string;
  accountBalance?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {step && <FastStepTracker current={step} />}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="relative max-w-2xl">
          <h1 className="mb-6 flex items-center gap-2 text-xl font-semibold text-daytrade [text-shadow:0_0_4px_currentColor,0_0_11px_currentColor,0_0_19px_currentColor]">
            <span aria-hidden="true">⚡</span>
            {title}
          </h1>
          {children}
        </div>
        {typeof accountBalance === "number" && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <AllocationWall balance={accountBalance} />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-white/70">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-daytrade"
    />
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: "good" | "bad" }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-2 text-sm">
      <span className="text-white/60">{label}</span>
      <span className={highlight === "good" ? "text-daytrade" : highlight === "bad" ? "text-loss" : "text-white"}>
        {value}
      </span>
    </div>
  );
}

function NextButton({
  onClick,
  disabled,
  label = "Continue",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-6 w-full rounded bg-daytrade px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40"
    >
      {label}
    </button>
  );
}
