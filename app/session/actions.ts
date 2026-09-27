"use server";

import { createClient } from "@/lib/supabase/server";
import { getDailyLossStatus, getTradingDateET } from "@/lib/data/dailyLossLock";
import { getTwoLossStatus } from "@/lib/data/twoLossLock";
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

  const daily = scoreDailyCheckIn(input.daily);
  if (!daily.passed) return { success: false, error: "Daily Check-In failed — session not logged." };

  const gate = scoreTradeGate(input.gate);
  if (!gate.passed) return { success: false, error: "Trade Gate failed — session not logged." };

  const setup = scoreSetup(input.setup);
  if (!setup.passed) return { success: false, error: "Setup Score too low — session not logged." };

  const plan = evaluateTradePlan(input.plan);
  if (!plan.valid) return { success: false, error: plan.error ?? "Invalid trade plan." };
  if (!plan.passed) return { success: false, error: "Risk/Reward below 2.0 — session not logged." };

  const { data: account } = await supabase
    .from("accounts")
    .select("balance, risk_percent")
    .eq("user_id", user.id)
    .maybeSingle();

  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;

  const risk = evaluateRisk(plan.tradeRisk!, input.plan.contracts, balance, riskPercent, plan.totalOutlay!);
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
      entry: input.plan.entryPremium,
      stop: plan.effectiveStopPremium,
      target: input.plan.targetPremium,
      contracts: input.plan.contracts,
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
// Daily Check-In, a trimmed 2-question Trade Gate, and a Setup Read that's
// informational only -- it never blocks, unlike the standard engine's
// Setup Score. Trade Plan (R:R >= 2.0) and Execution Check are unchanged.
// There's no composite 0-100 score here, just a plain authorized/blocked
// verdict -- see evaluateFastAuthorization's comment for why.
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

  const gate = scoreFastTradeGate(input.gate);
  if (!gate.passed) return { success: false, error: "Trade Gate failed — session not logged." };

  // Informational only -- the Setup Read never blocks in the Daytrade
  // Engine, it's just recorded for the session record / journal.
  const setup = scoreSetup(input.setup);

  const plan = evaluateTradePlan(input.plan);
  if (!plan.valid) return { success: false, error: plan.error ?? "Invalid trade plan." };
  if (!plan.passed) return { success: false, error: "Risk/Reward below 2.0 — session not logged." };

  const { data: account } = await supabase
    .from("accounts")
    .select("balance, risk_percent")
    .eq("user_id", user.id)
    .maybeSingle();

  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;

  const risk = evaluateRisk(plan.tradeRisk!, input.plan.contracts, balance, riskPercent, plan.totalOutlay!);
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
      entry: input.plan.entryPremium,
      stop: plan.effectiveStopPremium,
      target: input.plan.targetPremium,
      contracts: input.plan.contracts,
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
