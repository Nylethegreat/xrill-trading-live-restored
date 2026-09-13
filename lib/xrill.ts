// Ported and adapted from the original XRILL Python CLI (main.py, trade_score.py,
// account.py). Keep this file the single source of truth for the scoring/gating
// math — both the wizard UI and the server action that saves a session import
// from here, so the authorization decision always gets recomputed server-side
// rather than trusted from client input.
//
// Re-tooled for options buyers (SPY/QQQ/single-stock calls & puts) rather than
// futures point-value math: one option contract always controls 100 shares,
// so risk/reward is computed from premiums, not a per-ticker point-value
// lookup table.

export type OptionType = "CALL" | "PUT";
// Kept as an alias so anything still importing the old name keeps compiling.
export type Direction = OptionType;

export type StopMode = "PRICE" | "ZERO_OUT";

export const OPTIONS_CONTRACT_MULTIPLIER = 100;

export function calculateMaxRisk(balance: number, riskPercent: number) {
  return balance * (riskPercent / 100);
}

export interface DailyCheckIn {
  sleep: boolean;
  focused: boolean;
  emotional: boolean;
  disciplined: boolean;
}

export function scoreDailyCheckIn(a: DailyCheckIn) {
  const score = [a.sleep, a.focused, a.emotional, a.disciplined].filter(Boolean).length;
  const status = score === 4 ? "READY" : score === 3 ? "CAUTION" : "NOT READY";
  const passed = score >= 3;
  return { score, status, passed };
}

export interface TradeGate {
  marketOpen: boolean;
  tradingHours: boolean;
  liquidity: boolean;
  newsClear: boolean;
  mentallyAllowed: boolean;
}

export function scoreTradeGate(a: TradeGate) {
  const score = [
    a.marketOpen,
    a.tradingHours,
    a.liquidity,
    a.newsClear,
    a.mentallyAllowed,
  ].filter(Boolean).length;
  const passed = score >= 4;
  return { score, status: passed ? "CLEAR" : "BLOCKED", passed };
}

// Beginner-friendly setup checklist — five yes/no criteria, 5 points each,
// replacing the old 1-5 slider scales. Same 25-point scale everywhere else
// in the app (trade score weighting, dashboard/analytics display) still works
// unchanged.
export interface SetupChecklist {
  trendAlignment: boolean; // price above 9/21 EMA for calls, below for puts
  keyLevelReaction: boolean; // reacted off a clear support/resistance, VWAP, or pre-market level
  momentumVolume: boolean; // clean volume expansion on the entry candle
  newsClear: boolean; // no high-impact macro report or earnings in the next 30 minutes
  riskReward: boolean; // target offers at least 2x the defined stop loss
}

export function scoreSetup(a: SetupChecklist) {
  const total =
    (a.trendAlignment ? 5 : 0) +
    (a.keyLevelReaction ? 5 : 0) +
    (a.momentumVolume ? 5 : 0) +
    (a.newsClear ? 5 : 0) +
    (a.riskReward ? 5 : 0);

  let grade: string;
  if (total >= 25) grade = "A+ SETUP";
  else if (total >= 20) grade = "GOOD SETUP";
  else grade = "BLOCKED";

  const passed = total >= 20;
  return { total, grade, passed };
}

export interface TradePlanInput {
  ticker: string;
  optionType: OptionType;
  entryPremium: number;
  stopMode: StopMode;
  stopPremium?: number; // required when stopMode === "PRICE"; ignored (treated as 0) for "ZERO_OUT"
  targetPremium: number;
  contracts: number;
}

export interface TradePlanResult {
  valid: boolean;
  error?: string;
  effectiveStopPremium?: number;
  riskPerContractPoints?: number; // premium points at risk per contract
  rewardPerContractPoints?: number; // premium points of reward per contract
  riskPerContract?: number; // dollars at risk per contract (points * 100)
  rewardPerContract?: number; // dollars of reward per contract (points * 100)
  totalOutlay?: number; // entry premium * 100 * contracts
  tradeRisk?: number; // dollars at risk across all contracts
  tradeReward?: number; // dollars of reward across all contracts
  rr?: number;
  passed?: boolean;
}

export function evaluateTradePlan(input: TradePlanInput): TradePlanResult {
  const { ticker, entryPremium, targetPremium, contracts, stopMode } = input;

  if (!ticker || !ticker.trim()) {
    return { valid: false, error: "Ticker is required (e.g. SPY, QQQ, NVDA)." };
  }

  if (!entryPremium || entryPremium <= 0) {
    return { valid: false, error: "Contract premium (buy price) must be greater than $0." };
  }

  if (!contracts || contracts <= 0) {
    return { valid: false, error: "Number of contracts must be greater than 0." };
  }

  const effectiveStopPremium = stopMode === "ZERO_OUT" ? 0 : input.stopPremium ?? NaN;

  if (Number.isNaN(effectiveStopPremium) || effectiveStopPremium < 0) {
    return { valid: false, error: "Enter a valid stop-loss premium, or choose Full Premium at Risk." };
  }

  if (effectiveStopPremium >= entryPremium) {
    return { valid: false, error: "Stop premium must be BELOW your entry premium." };
  }

  if (!targetPremium || targetPremium <= entryPremium) {
    return { valid: false, error: "Target premium must be ABOVE your entry premium." };
  }

  const riskPerContractPoints = entryPremium - effectiveStopPremium;
  const rewardPerContractPoints = targetPremium - entryPremium;

  const riskPerContract = riskPerContractPoints * OPTIONS_CONTRACT_MULTIPLIER;
  const rewardPerContract = rewardPerContractPoints * OPTIONS_CONTRACT_MULTIPLIER;

  const tradeRisk = riskPerContract * contracts;
  const tradeReward = rewardPerContract * contracts;
  const totalOutlay = entryPremium * OPTIONS_CONTRACT_MULTIPLIER * contracts;

  if (tradeRisk <= 0) return { valid: false, error: "Trade risk must be greater than $0." };
  if (tradeReward <= 0) return { valid: false, error: "Trade reward must be greater than $0." };

  const rr = tradeReward / tradeRisk;

  return {
    valid: true,
    effectiveStopPremium,
    riskPerContractPoints,
    rewardPerContractPoints,
    riskPerContract,
    rewardPerContract,
    totalOutlay,
    tradeRisk,
    tradeReward,
    rr,
    passed: rr >= 2,
  };
}

export function evaluateRisk(
  tradeRisk: number,
  contracts: number,
  accountBalance: number,
  riskPercent: number
) {
  const maxRisk = calculateMaxRisk(accountBalance, riskPercent);
  const riskPerContract = tradeRisk / contracts;
  const maxContracts = riskPerContract > 0 ? Math.floor(maxRisk / riskPerContract) : 0;
  const actualRiskPercent = (tradeRisk / accountBalance) * 100;

  const passed = maxContracts >= 1 && tradeRisk <= maxRisk;

  return { maxRisk, riskPerContract, maxContracts, actualRiskPercent, passed };
}

export interface ExecutionCheck {
  confirmation: boolean;
  plannedEntry: boolean;
  stopReady: boolean;
  riskLimit: boolean;
  emotional: boolean;
}

export function scoreExecution(a: ExecutionCheck) {
  const score = [
    a.confirmation,
    a.plannedEntry,
    a.stopReady,
    a.riskLimit,
    a.emotional,
  ].filter(Boolean).length;
  const passed = score >= 4;
  return { score, status: passed ? "APPROVED" : "BLOCKED", passed };
}

export function calculateTradeScore(
  dailyScore: number,
  gateScore: number,
  setupScore: number,
  riskApproved: boolean,
  executionScore: number
) {
  let score = 0;
  score += (dailyScore / 4) * 15;
  score += (gateScore / 5) * 20;
  score += (setupScore / 25) * 30;
  if (riskApproved) score += 20;
  score += (executionScore / 5) * 15;

  score = Math.round(score);

  let grade: string;
  let status: string;
  if (score >= 90) {
    grade = "A+";
    status = "HIGH QUALITY SETUP";
  } else if (score >= 80) {
    grade = "A";
    status = "GOOD SETUP";
  } else if (score >= 70) {
    grade = "B";
    status = "ACCEPTABLE";
  } else if (score >= 60) {
    grade = "C";
    status = "CAUTION";
  } else {
    grade = "F";
    status = "NO TRADE";
  }

  return { score, grade, status };
}

export function evaluateAuthorization(
  dailyScore: number,
  gateScore: number,
  setupScore: number,
  riskApproved: boolean,
  executionScore: number,
  tradeScore: number
) {
  const reasons: string[] = [];

  if (dailyScore < 3) reasons.push("Daily Readiness");
  if (gateScore < 4) reasons.push("Trade Gate");
  if (setupScore < 20) reasons.push("Setup Quality");
  if (!riskApproved) reasons.push("Risk Management");
  if (executionScore < 4) reasons.push("Execution");
  if (tradeScore < 80) reasons.push("XRILL Score");

  return {
    authorized: reasons.length === 0,
    rejectionReason: reasons.length > 0 ? reasons.join(", ") : null,
  };
}

export function scoreGrade(score: number) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "F";
}
