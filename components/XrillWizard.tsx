"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TorpedoGauge from "@/components/session/TorpedoGauge";
import {
  scoreDailyCheckIn,
  scoreTradeGate,
  scoreSetup,
  evaluateTradePlan,
  evaluateRisk,
  calculateMaxRisk,
  scoreExecution,
  OPTIONS_CONTRACT_MULTIPLIER,
  type OptionType,
  type StopMode,
} from "@/lib/xrill";
import { submitXrillSession } from "@/app/session/actions";
import StepTracker from "./StepTracker";
import Hint from "./Hint";

type Step = "daily" | "gate" | "setup" | "plan" | "risk" | "execution" | "result" | "blocked";

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
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3">
      <span className="text-sm text-white/80">
        {label}
        {hint && <Hint text={hint} />}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded px-3 py-1 text-sm ${
            value === true ? "bg-accent text-black" : "border border-white/20 text-white/60"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded px-3 py-1 text-sm ${
            value === false ? "bg-blocked text-white" : "border border-white/20 text-white/60"
          }`}
        >
          No
        </button>
      </div>
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
        checked ? "border-accent bg-accent/10" : "border-white/10 bg-surface hover:border-white/25"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
          checked ? "border-accent bg-accent text-black" : "border-white/30 text-transparent"
        }`}
      >
        ✓
      </span>
      <span>
        <span className="block text-sm font-medium text-white">{label} <span className="font-mono text-xs text-white/40">+5</span></span>
        <span className="block text-xs text-white/50">{detail}</span>
      </span>
    </button>
  );
}

export default function XrillWizard({
  accountBalance,
  riskPercent,
}: {
  accountBalance: number;
  riskPercent: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("daily");
  const [blockedReason, setBlockedReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [daily, setDaily] = useState({
    sleep: null as boolean | null,
    focused: null as boolean | null,
    emotional: null as boolean | null,
    disciplined: null as boolean | null,
  });

  const [gate, setGate] = useState({
    marketOpen: null as boolean | null,
    tradingHours: null as boolean | null,
    liquidity: null as boolean | null,
    newsClear: null as boolean | null,
    mentallyAllowed: null as boolean | null,
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

  const [result, setResult] = useState<{
    tradeScore: number;
    authorized: boolean;
    rejectionReason: string | null;
  } | null>(null);

  if (step === "daily") {
    const dailyValues = Object.values(daily);
    const answeredCount = dailyValues.filter((v) => v !== null).length;
    const allAnswered = dailyValues.every((v) => v !== null);
    return (
      <Shell title="Step 1/6 — Daily Check-In" step="daily">
        <YesNo label="Did you sleep well?" value={daily.sleep} onChange={(v) => setDaily({ ...daily, sleep: v })} />
        <YesNo label="Are you focused today?" value={daily.focused} onChange={(v) => setDaily({ ...daily, focused: v })} />
        <YesNo label="Are you emotionally stable?" value={daily.emotional} onChange={(v) => setDaily({ ...daily, emotional: v })} />
        <YesNo
          label="Willing to follow your trading rules?"
          value={daily.disciplined}
          onChange={(v) => setDaily({ ...daily, disciplined: v })}
        />
        <TorpedoGauge answered={answeredCount} total={dailyValues.length} />
        <NextButton
          disabled={!allAnswered}
          onClick={() => {
            const r = scoreDailyCheckIn(daily as any);
            if (!r.passed) {
              setBlockedReason(`Daily Check-In: ${r.score}/4 — STATUS: ${r.status}. Session not logged.`);
              setStep("blocked");
            } else {
              setStep("gate");
            }
          }}
        />
      </Shell>
    );
  }

  if (step === "gate") {
    const allAnswered = Object.values(gate).every((v) => v !== null);
    return (
      <Shell title="Step 2/6 — Trade Gate" step="gate">
        <YesNo label="Is the market open?" value={gate.marketOpen} onChange={(v) => setGate({ ...gate, marketOpen: v })} />
        <YesNo label="Inside your allowed trading hours?" value={gate.tradingHours} onChange={(v) => setGate({ ...gate, tradingHours: v })} />
        <YesNo
          label="Is liquidity acceptable?"
          hint="Are bid-ask spreads tight, with fast order fills? Wide spreads on thin options can eat your edge before you even enter."
          value={gate.liquidity}
          onChange={(v) => setGate({ ...gate, liquidity: v })}
        />
        <YesNo label="Is major news risk clear?" value={gate.newsClear} onChange={(v) => setGate({ ...gate, newsClear: v })} />
        <YesNo
          label="Psychologically allowed to trade?"
          value={gate.mentallyAllowed}
          onChange={(v) => setGate({ ...gate, mentallyAllowed: v })}
        />
        <NextButton
          disabled={!allAnswered}
          onClick={() => {
            const r = scoreTradeGate(gate as any);
            if (!r.passed) {
              setBlockedReason(`Trade Gate: ${r.score}/5 — STATUS: ${r.status}. Session not logged.`);
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
      <Shell title="Step 3/6 — Setup Score" step="setup">
        <p className="mb-3 text-xs text-white/50">
          Five plain-language checks, 5 points each. You need 20/25 to continue — a system that authorizes
          everything isn't disciplined, it's just permissive.
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
    const maxContracts = riskPerContract && riskPerContract > 0 ? Math.floor(maxRisk / riskPerContract) : null;
    const exceedsMax = maxContracts !== null && contracts > maxContracts;

    return (
      <Shell title="Step 4/6 — Trade Plan" step="plan">
        <div className="space-y-3">
          <Field label="Ticker">
            <input
              value={plan.ticker}
              onChange={(e) => setPlan({ ...plan, ticker: e.target.value.toUpperCase() })}
              placeholder="SPY, QQQ, NVDA, TSLA..."
              className="w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
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
                    plan.optionType === t ? "bg-accent text-black" : "border border-white/20 text-white/60"
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
                1 contract <Hint text="One options contract always controls 100 shares of the underlying." /> = ${entry.toFixed(2)} × 100 = ${(entry * OPTIONS_CONTRACT_MULTIPLIER).toFixed(2)} per contract
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
                  plan.stopMode === "PRICE" ? "bg-accent text-black" : "border border-white/20 text-white/60"
                }`}
              >
                Contract Stop-Loss Price
              </button>
              <button
                type="button"
                onClick={() => setPlan({ ...plan, stopMode: "ZERO_OUT" })}
                className={`flex-1 rounded px-3 py-2 text-sm ${
                  plan.stopMode === "ZERO_OUT" ? "bg-accent text-black" : "border border-white/20 text-white/60"
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
            <p className={`text-xs ${exceedsMax ? "text-blocked" : "text-white/40"}`}>
              Maximum allowed by your risk settings: {maxContracts} contract{maxContracts === 1 ? "" : "s"} (max risk $
              {maxRisk.toFixed(2)} at {riskPercent}%).
              {exceedsMax && (
                <>
                  {" "}
                  ⚠️ Exceeds max allowed risk of ${maxRisk.toFixed(2)}. Reduce to {maxContracts} contract
                  {maxContracts === 1 ? "" : "s"} to qualify.
                </>
              )}
            </p>
          )}
        </div>

        {planError && <p className="mt-3 text-sm text-blocked">{planError}</p>}

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
              setBlockedReason(
                `Trade Plan: R:R ${r.rr!.toFixed(2)} — minimum required is 2.00. Session not logged.`
              );
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
    const risk = evaluateRisk(planResult.tradeRisk!, contracts, accountBalance, riskPercent);

    return (
      <Shell title="Step 5/6 — Risk Manager" step="risk">
        <p className="mb-2 text-xs text-white/50">
          1 options contract <Hint text="Standard equity/ETF options contracts control 100 shares of the underlying — that's why risk is always premium × 100 × contracts." /> controls 100 shares — every dollar amount below already accounts for that.
        </p>
        <Row label="Account balance" value={`$${accountBalance.toLocaleString()}`} />
        <Row label="Risk per trade" value={`${riskPercent}%`} />
        <Row label="Maximum allowed risk" value={`$${risk.maxRisk.toFixed(2)}`} />
        <Row label="Trade risk" value={`$${planResult.tradeRisk!.toFixed(2)}`} />
        <Row label="Actual account risk" value={`${risk.actualRiskPercent.toFixed(2)}%`} />
        <Row label="Risk per contract" value={`$${risk.riskPerContract.toFixed(2)}`} />
        <Row label="Maximum contracts allowed" value={`${risk.maxContracts}`} />
        <Row
          label="Status"
          value={risk.passed ? "✅ APPROVED" : "❌ TOO LARGE"}
          highlight={risk.passed ? "good" : "bad"}
        />
        {!risk.passed && (
          <p className="mt-2 text-xs text-blocked">
            ⚠️ Exceeds max allowed risk of ${risk.maxRisk.toFixed(2)}. Reduce to {risk.maxContracts} contract
            {risk.maxContracts === 1 ? "" : "s"} to qualify.
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

  if (step === "execution") {
    const allAnswered = Object.values(execution).every((v) => v !== null);
    return (
      <Shell title="Step 6/6 — Execution Check" step="execution">
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

        {submitError && <p className="mt-3 text-sm text-blocked">{submitError}</p>}

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

            const res = await submitXrillSession({
              daily: daily as any,
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
              tradeScore: res.tradeScore!,
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
      <Shell title="🟣 Session Blocked">
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
      <Shell title={result.authorized ? "🟢 Trade Authorized" : "🟣 Trade Blocked"}>
        <Row label="XRILL Score" value={`${result.tradeScore}/100`} />
        {!result.authorized && result.rejectionReason && (
          <Row label="Rejection reasons" value={result.rejectionReason} highlight="bad" />
        )}
        <p className="mt-4 text-sm text-white/60">
          {result.authorized
            ? "XRILL conditions satisfied. You are cleared to execute the trade."
            : "Do not execute this trade — conditions were not satisfied."}
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90"
        >
          Back to Dashboard
        </button>
      </Shell>
    );
  }

  return null;
}

function Shell({ title, step, children }: { title: string; step?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {step && <StepTracker current={step} />}
      <h1 className="mb-6 text-xl font-semibold">{title}</h1>
      {children}
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
      className="w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
    />
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "good" | "bad";
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-2 text-sm">
      <span className="text-white/60">{label}</span>
      <span
        className={
          highlight === "good" ? "text-accent" : highlight === "bad" ? "text-blocked" : "text-white"
        }
      >
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
      className="mt-6 w-full rounded bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function Badge({ tone, children }: { tone: "good" | "blocked"; children: React.ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        tone === "good" ? "border-accent/30 bg-accent/15 text-accent" : "border-blocked/30 bg-blocked/15 text-blocked"
      }`}
    >
      {children}
    </span>
  );
}
