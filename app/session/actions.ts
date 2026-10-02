"use server";

import { createClient } from "@/lib/supabase/server";
import { evaluateStructure, isStructure, type Leg, type Structure } from "@/lib/structures";
import { AFTER_FACT_REASONS } from "@/lib/afterFact";
import { getDailyLossStatus, getTradingDateET } from "@/lib/data/dailyLossLock";
import { getTwoLossStatus } from "@/lib/data/twoLossLock";
import { getOpenPositionsStatus } from "@/lib/data/openPositions";
import {
  scoreDailyCheckIn,
  scoreTradeGate,
  scoreFastTradeGate,
  scoreSetup,
  evaluateTradePlan,
  evaluateRisk,
  scoreExecution,
  calculateTradeScore,
  evaluateAuthorization,
  evaluateFastAuthorization,
  OPTIONS_CONTRACT_MULTIPLIER,
  type OptionType,
  type StopMode,
} from "@/lib/xrill";

// Strike and expiration are optional details (they don't affect any gate),
// so bad or missing values are simply dropped instead of failing the
// session: a strike must be a positive number, an expiration a real
// YYYY-MM-DD date.
function cleanContractDetails(strike?: number | null, expiration?: string | null) {
  const out: { strike?: number; expiration?: string } = {};
  if (typeof strike === "number" && Number.isFinite(strike) && strike > 0) out.strike = strike;
  if (typeof expiration === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiration) && !Number.isNaN(Date.parse(expiration))) {
    out.expiration = expiration;
  }
  return out;
}

// Multi-leg structures are re-derived from their legs here -- the server
// never trusts a client-sent entry premium for a spread. The net debit
// becomes the entry premium and, for a vertical, the strike width caps
// the target, so every downstream gate sizes the structure as ONE position.
type PlanInput = SubmitSessionInput["plan"];
function normalizePlan(
  p: PlanInput
): { ok: true; plan: PlanInput & { maxValue?: number }; structure: Structure; legs: Leg[] | null } | { ok: false; error: string } {
  const structure: Structure = isStructure(p.structure) ? p.structure : "single";
  if (structure === "single") return { ok: true, plan: { ...p }, structure, legs: null };
  const legs = Array.isArray(p.legs) ? p.legs : [];
  const r = evaluateStructure(structure, legs);
  if (!r.valid || r.netDebit === undefined) return { ok: false, error: r.error ?? "Invalid spread legs." };
  const cleanLegs: Leg[] = legs.map((l) => ({ side: l.side, type: l.type, strike: l.strike, premium: l.premium }));
  return {
    ok: true,
    plan: { ...p, entryPremium: r.netDebit, maxValue: r.width, optionType: cleanLegs[0].type },
    structure,
    legs: cleanLegs,
  };
}

export interface SubmitSessionInput {
  daily: { sleep: boolean; focused: boolean; emotional: boolean; disciplined: boolean };
  gate: {
    marketOpen: boolean;
    tradingHours: boolean;
    liquidity: boolean;
    newsClear: boolean;
    mentallyAllowed: boolean;
  };
  setup: {
    trendAlignment: boolean;
    keyLevelReaction: boolean;
    momentumVolume: boolean;
    newsClear: boolean;
    riskReward: boolean;
  };
  plan: {
    ticker: string;
    optionType: OptionType;
    entryPremium: number;
    stopMode: StopMode;
    stopPremium?: number;
    targetPremium: number;
    contracts: number;
    strike?: number | null; // optional -- shown on the open-position card
    expiration?: string | null; // optional, YYYY-MM-DD
    structure?: Structure; // single option (default), vertical spread, straddle/strangle
    legs?: Leg[] | null; // required for multi-leg structures
  };
  execution: {
    confirmation: boolean;
    plannedEntry: boolean;
    stopReady: boolean;
    riskLimit: boolean;
    emotional: boolean;
  };
}

export interface SubmitSessionResult {
  success: boolean;
  error?: string;
  tradeScore?: number;
  authorized?: boolean;
  rejectionReason?: string | null;
  sessionId?: number;
}

export async function submitXrillSession(
  input: SubmitSessionInput
): Promise<SubmitSessionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  // Hard lock, checked first and server-side no matter what the client UI
  // shows -- if today's journaled net P/L has already hit the account's
  // daily loss limit, no new session gets evaluated at all, full stop.
  const dailyLoss = await getDailyLossStatus(user.id);
  if (dailyLoss.locked) {
    return {
      success: false,
      error: `Daily loss limit hit ($${Math.abs(dailyLoss.netPnl).toLocaleString()} of $${dailyLoss.limit.toLocaleString()}) — terminal is locked until tomorrow.`,
    };
  }

  // Same idea, a different trigger: two stop-outs today locks the
  // terminal even if the dollar loss limit above hasn't been hit yet.
  const twoLoss = await getTwoLossStatus(user.id);
  if (twoLoss.locked) {
    return {
      success: false,
      error: `Two-Loss Lockout: ${twoLoss.stopOutCount} stop-outs journaled today — terminal is locked until tomorrow.`,
    };
  }

  // Hard cap on simultaneously open, unjournaled positions -- account-wide
  // across both engines, same as the two locks above. Multiple unmonitored
  // trades open at once was a real gap (nothing previously stopped it);
  // this closes it server-side rather than trusting the wizard to ask.
  const openPositions = await getOpenPositionsStatus(user.id);
  if (openPositions.atLimit) {
    return {
      success: false,
      error: `Concurrent Trade Limit: ${openPositions.count} position${openPositions.count === 1 ? "" : "s"} already open (max ${openPositions.limit}) — journal or close an existing trade in the Journal before opening another.`,
    };
  }

  const daily = scoreDailyCheckIn(input.daily);
  if (!daily.passed) return { success: false, error: "Daily Check-In failed — session not logged." };

  const gate = scoreTradeGate(input.gate);
  if (!gate.passed) return { success: false, error: "Trade Gate failed — session not logged." };

  const setup = scoreSetup(input.setup);
  if (!setup.passed) return { success: false, error: "Setup Score too low — session not logged." };

  const normalized = normalizePlan(input.plan);
  if (!normalized.ok) return { success: false, error: normalized.error };
  const plan = evaluateTradePlan(normalized.plan);
  if (!plan.valid) return { success: false, error: plan.error ?? "Invalid trade plan." };
  if (!plan.passed) return { success: false, error: "Risk/Reward below 2.0 — session not logged." };

  const { data: account } = await supabase
    .from("accounts")
    .select("balance, risk_percent, stop_loss_percent")
    .eq("user_id", user.id)
    .maybeSingle();

  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;

  const risk = evaluateRisk(plan.tradeRisk!, input.plan.contracts, balance, riskPercent, plan.totalOutlay!, account?.stop_loss_percent ?? undefined);
  if (!risk.passed) return { success: false, error: "Risk Manager rejected the trade — session not logged." };

  const execution = scoreExecution(input.execution);
  if (!execution.passed) return { success: false, error: "Execution Check failed — session not logged." };

  const tradeScoreResult = calculateTradeScore(
    daily.score,
    gate.score,
    setup.total,
    risk.passed,
    execution.score
  );

  const auth = evaluateAuthorization(
    daily.score,
    gate.score,
    setup.total,
    risk.passed,
    execution.score,
    tradeScoreResult.score
  );

  const { data: row, error } = await supabase
    .from("xrill_sessions")
    .insert({
      user_id: user.id,
      daily_score: daily.score,
      trade_gate_score: gate.score,
      setup_score: setup.total,
      ticker: input.plan.ticker.toUpperCase(),
      direction: input.plan.optionType,
      entry: normalized.plan.entryPremium,
      stop: plan.effectiveStopPremium,
      target: input.plan.targetPremium,
      contracts: input.plan.contracts,
      ...cleanContractDetails(normalized.structure === "single" ? input.plan.strike : null, input.plan.expiration),
      structure: normalized.structure,
      legs: normalized.legs,
      point_value: OPTIONS_CONTRACT_MULTIPLIER,
      risk_points: plan.riskPerContractPoints,
      reward_points: plan.rewardPerContractPoints,
      trade_risk: plan.tradeRisk,
      trade_reward: plan.tradeReward,
      rr: plan.rr,
      max_risk: risk.maxRisk,
      risk_approved: risk.passed,
      execution_score: execution.score,
      trade_score: tradeScoreResult.score,
      trade_authorized: auth.authorized,
      rejection_reason: auth.rejectionReason,
      session_date: getTradingDateET(),
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    tradeScore: tradeScoreResult.score,
    authorized: auth.authorized,
    rejectionReason: auth.rejectionReason,
    sessionId: row.id,
  };
}

// The Daytrade Engine -- a 4-step fast pass through the same underlying
// scoring math (lib/xrill.ts stays the single source of truth so the
// server always re-derives the verdict, never trusts client input). No
// Daily Check-In and a trimmed 2-question Trade Gate. The Setup Read now
// gates the same as the standard engine (need 20/25, i.e. 4 of 5) --
// previously informational-only, changed so a fast pass still requires
// real confluence, not just speed. Trade Plan (R:R >= 2.0) and Execution
// Check are unchanged. There's no composite 0-100 score here, just a
// plain authorized/blocked verdict -- see evaluateFastAuthorization's
// comment for why.
export interface SubmitFastSessionInput {
  gate: { mentallyAllowed: boolean; liquidity: boolean };
  setup: {
    trendAlignment: boolean;
    keyLevelReaction: boolean;
    momentumVolume: boolean;
    newsClear: boolean;
    riskReward: boolean;
  };
  plan: {
    ticker: string;
    optionType: OptionType;
    entryPremium: number;
    stopMode: StopMode;
    stopPremium?: number;
    targetPremium: number;
    contracts: number;
    strike?: number | null; // optional -- shown on the open-position card
    expiration?: string | null; // optional, YYYY-MM-DD
    structure?: Structure; // single option (default), vertical spread, straddle/strangle
    legs?: Leg[] | null; // required for multi-leg structures
  };
  execution: {
    confirmation: boolean;
    plannedEntry: boolean;
    stopReady: boolean;
    riskLimit: boolean;
    emotional: boolean;
  };
}

export interface SubmitFastSessionResult {
  success: boolean;
  error?: string;
  authorized?: boolean;
  rejectionReason?: string | null;
  sessionId?: number;
}

export async function submitFastSession(
  input: SubmitFastSessionInput
): Promise<SubmitFastSessionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  // Same hard lock as the standard engine -- the daily loss limit is
  // account-wide, not per-engine. A faster path to a trade doesn't mean a
  // faster path around the lock.
  const dailyLoss = await getDailyLossStatus(user.id);
  if (dailyLoss.locked) {
    return {
      success: false,
      error: `Daily loss limit hit ($${Math.abs(dailyLoss.netPnl).toLocaleString()} of $${dailyLoss.limit.toLocaleString()}) — terminal is locked until tomorrow.`,
    };
  }

  // Account-wide, not per-engine, same as the daily loss lock above.
  const twoLoss = await getTwoLossStatus(user.id);
  if (twoLoss.locked) {
    return {
      success: false,
      error: `Two-Loss Lockout: ${twoLoss.stopOutCount} stop-outs journaled today — terminal is locked until tomorrow.`,
    };
  }

  // Same cap as the standard engine, checked here too -- account-wide,
  // not per-engine.
  const openPositions = await getOpenPositionsStatus(user.id);
  if (openPositions.atLimit) {
    return {
      success: false,
      error: `Concurrent Trade Limit: ${openPositions.count} position${openPositions.count === 1 ? "" : "s"} already open (max ${openPositions.limit}) — journal or close an existing trade in the Journal before opening another.`,
    };
  }

  const gate = scoreFastTradeGate(input.gate);
  if (!gate.passed) return { success: false, error: "Trade Gate failed — session not logged." };

  // Now gates the same threshold as the standard engine (20/25, i.e. 4 of
  // 5 -- see scoreSetup's `passed` in lib/xrill.ts). Previously
  // informational-only; a fast pass shouldn't mean a free pass on setup
  // quality.
  const setup = scoreSetup(input.setup);
  if (!setup.passed) return { success: false, error: "Setup Score too low — session not logged." };

  const normalized = normalizePlan(input.plan);
  if (!normalized.ok) return { success: false, error: normalized.error };
  const plan = evaluateTradePlan(normalized.plan);
  if (!plan.valid) return { success: false, error: plan.error ?? "Invalid trade plan." };
  if (!plan.passed) return { success: false, error: "Risk/Reward below 2.0 — session not logged." };

  const { data: account } = await supabase
    .from("accounts")
    .select("balance, risk_percent, stop_loss_percent")
    .eq("user_id", user.id)
    .maybeSingle();

  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;

  const risk = evaluateRisk(plan.tradeRisk!, input.plan.contracts, balance, riskPercent, plan.totalOutlay!, account?.stop_loss_percent ?? undefined);
  if (!risk.passed) return { success: false, error: "Risk Manager rejected the trade — session not logged." };

  const execution = scoreExecution(input.execution);
  if (!execution.passed) return { success: false, error: "Execution Check failed — session not logged." };

  const auth = evaluateFastAuthorization(gate.score, risk.passed, execution.score);

  const { data: row, error } = await supabase
    .from("xrill_sessions")
    .insert({
      user_id: user.id,
      engine: "daytrade",
      daily_score: null,
      trade_gate_score: gate.score,
      setup_score: setup.total,
      ticker: input.plan.ticker.toUpperCase(),
      direction: input.plan.optionType,
      entry: normalized.plan.entryPremium,
      stop: plan.effectiveStopPremium,
      target: input.plan.targetPremium,
      contracts: input.plan.contracts,
      ...cleanContractDetails(normalized.structure === "single" ? input.plan.strike : null, input.plan.expiration),
      structure: normalized.structure,
      legs: normalized.legs,
      point_value: OPTIONS_CONTRACT_MULTIPLIER,
      risk_points: plan.riskPerContractPoints,
      reward_points: plan.rewardPerContractPoints,
      trade_risk: plan.tradeRisk,
      trade_reward: plan.tradeReward,
      rr: plan.rr,
      max_risk: risk.maxRisk,
      risk_approved: risk.passed,
      execution_score: execution.score,
      trade_score: null,
      trade_authorized: auth.authorized,
      rejection_reason: auth.rejectionReason,
      session_date: getTradingDateET(),
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    authorized: auth.authorized,
    rejectionReason: auth.rejectionReason,
    sessionId: row.id,
  };
}

// ------------------------------------------------- After-the-fact log
// EMERGENCY path for a trade that was already taken without running the
// gates first (late, no stops/alerts set, no charts, outside hours...).
// It is NOT an authorization: it skips straight to Trade Plan + Risk
// Manager to get the trade on record. Deliberately:
//   - stored with trade_authorized = false and logged_after = true, so it
//     never pads the streak, authorization rate or XRILL score stats;
//   - NOT blocked by the daily lock, Two-Loss Lockout or position cap --
//     the trade already exists, and recording it beats hiding it. Those
//     conditions come back as warnings instead;
//   - still an open position afterwards, so it gets journaled and closed.
export interface SubmitAfterFactInput {
  reasons: string[];
  otherReason?: string;
  plan: SubmitSessionInput["plan"];
}

export interface SubmitAfterFactResult {
  success: boolean;
  error?: string;
  sessionId?: number;
  warnings?: string[];
}

export async function submitAfterFactSession(input: SubmitAfterFactInput): Promise<SubmitAfterFactResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const reasons = (input.reasons ?? []).filter((r) => (AFTER_FACT_REASONS as readonly string[]).includes(r));
  const other = input.otherReason?.trim().slice(0, 200);
  if (other) reasons.push(`Other: ${other}`);
  if (reasons.length === 0) return { success: false, error: "Pick at least one reason this trade wasn't logged first." };

  const normalized = normalizePlan(input.plan);
  if (!normalized.ok) return { success: false, error: normalized.error };
  // R:R isn't enforced here (the trade is already on), but the numbers
  // still have to make sense to be recorded.
  const plan = evaluateTradePlan(normalized.plan);
  if (!plan.valid) return { success: false, error: plan.error ?? "Invalid trade plan." };

  const { data: account } = await supabase
    .from("accounts")
    .select("balance, risk_percent, stop_loss_percent")
    .eq("user_id", user.id)
    .maybeSingle();
  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;
  const risk = evaluateRisk(plan.tradeRisk!, input.plan.contracts, balance, riskPercent, plan.totalOutlay!, account?.stop_loss_percent ?? undefined);

  const [dailyLoss, twoLoss, openPositions] = await Promise.all([
    getDailyLossStatus(user.id),
    getTwoLossStatus(user.id),
    getOpenPositionsStatus(user.id),
  ]);

  const warnings: string[] = [];
  if (!plan.passed) warnings.push(`R:R is ${plan.rr!.toFixed(2)}, below the 2.00 minimum.`);
  if (!risk.passed) warnings.push(`Over your risk limits: max ${risk.maxContracts} contract${risk.maxContracts === 1 ? "" : "s"} allowed, $${risk.maxRisk.toFixed(2)} max risk.`);
  if (dailyLoss.locked) warnings.push("Taken while your Daily Loss Limit was already hit.");
  if (twoLoss.locked) warnings.push("Taken during a Two-Loss Lockout.");
  if (openPositions.atLimit) warnings.push(`Over the ${openPositions.limit}-position limit.`);

  const { data: row, error } = await supabase
    .from("xrill_sessions")
    .insert({
      user_id: user.id,
      ticker: input.plan.ticker.toUpperCase(),
      direction: normalized.plan.optionType,
      entry: normalized.plan.entryPremium,
      stop: plan.effectiveStopPremium,
      target: input.plan.targetPremium,
      contracts: input.plan.contracts,
      ...cleanContractDetails(normalized.structure === "single" ? input.plan.strike : null, input.plan.expiration),
      structure: normalized.structure,
      legs: normalized.legs,
      point_value: OPTIONS_CONTRACT_MULTIPLIER,
      risk_points: plan.riskPerContractPoints,
      reward_points: plan.rewardPerContractPoints,
      trade_risk: plan.tradeRisk,
      trade_reward: plan.tradeReward,
      rr: plan.rr,
      max_risk: risk.maxRisk,
      risk_approved: risk.passed,
      trade_score: null,
      trade_authorized: false,
      logged_after: true,
      after_fact_reasons: reasons,
      rejection_reason: "Logged after the fact (emergency) — gates were skipped",
      session_date: getTradingDateET(),
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, sessionId: row.id, warnings };
}
