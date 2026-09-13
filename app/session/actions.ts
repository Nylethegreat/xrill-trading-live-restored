"use server";

import { createClient } from "@/lib/supabase/server";
import {
  scoreDailyCheckIn,
  scoreTradeGate,
  scoreSetup,
  evaluateTradePlan,
  evaluateRisk,
  scoreExecution,
  calculateTradeScore,
  evaluateAuthorization,
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

  const risk = evaluateRisk(plan.tradeRisk!, input.plan.contracts, balance, riskPercent);
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
      session_date: new Date().toISOString().slice(0, 10),
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
