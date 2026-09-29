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

import {
  ACTIVE_SLEEVE_PERCENT,
  DEFAULT_STOP_PERCENT,
  clampRiskPercent,
  clampStopPercent,
  roundCents,
  wholeUnitsWithin,
} from "@/lib/riskProfile";

export type OptionType = "CALL" | "PUT";
// Kept as an alias so anything still importing the old name keeps compiling.
export type Direction = OptionType;

export type StopMode = "PRICE" | "ZERO_OUT";

export const OPTIONS_CONTRACT_MULTIPLIER = 100;

// The 60% deployable / 40% idle-buffer split, the risk % bounds and the
// structural stop all live in lib/riskProfile.ts now -- re-exported here so
// existing imports keep working and there is still exactly one source.
export { ACTIVE_SLEEVE_PERCENT } from "@/lib/riskProfile";

// Risk % is clamped to the Risk Tiering Matrix (max 22%) so a stale or
// mistyped setting (e.g. 40) can never size a trade past the matrix.
export function calculateMaxRisk(balance: number, riskPercent: number) {
  return roundCents(balance * (clampRiskPercent(riskPercent) / 100));
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

// The Daytrade Engine's trimmed Trade Gate -- only the two questions that
// actually matter when speed is the point: are you psychologically clear to
// trade, and is liquidity acceptable (with a real warning about thin
// liquidity, since the whole engine trades higher risk/less confluence).
// Both are required -- unlike the Setup Read below, this one still gates.
export interface FastTradeGate {
  mentallyAllowed: boolean;
  liquidity: boolean;
}

export function scoreFastTradeGate(a: FastTradeGate) {
  const score = [a.mentallyAllowed, a.liquidity].filter(Boolean).length;
  const passed = score === 2;
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

// BUG FIX: maxContracts used to come from risk-to-stop alone. On a cheap
// contract with a tight stop, that let this recommend more contracts than
// the account could physically afford to buy in the first place -- e.g. a
// $280 account, $0.20 premium with a $0.02 stop, "risk" only $2/contract so
// the risk-based cap alone said 20+ contracts, even though 20 contracts at
// $20/contract ($0.20 x 100) costs $400 -- more than the whole account.
// Now capped by BOTH the risk-per-trade % ceiling AND the total premium
// outlay never exceeding the deployable Active Sleeve (60% of balance,
// ACTIVE_SLEEVE_PERCENT above) -- whichever is more restrictive wins.
export function evaluateRisk(
  tradeRisk: number,
  contracts: number,
  accountBalance: number,
  riskPercent: number,
  totalOutlay: number,
  stopPercent: number = DEFAULT_STOP_PERCENT
) {
  const maxRisk = calculateMaxRisk(accountBalance, riskPercent);
  const stopPct = clampStopPercent(stopPercent);
  const riskPerContract = roundCents(tradeRisk / contracts);
  const outlayPerContract = contracts > 0 ? roundCents(totalOutlay / contracts) : 0;

  // Structural stop: size as if each contract can lose at least stopPct of
  // its premium, even when the planned stop is tighter. A tight stop that
  // slips (gaps, fast 0DTE moves) then still can't breach Max Trade Loss.
  // Wider stops (incl. Full Premium at Risk) use their real, larger risk.
  const sizingRiskPerContract = roundCents(Math.max(riskPerContract, outlayPerContract * (stopPct / 100)));

  // Computed in cents -- float division used to turn an exact 50 into 49.
  const maxContractsByRisk = wholeUnitsWithin(maxRisk, sizingRiskPerContract);

  const activeSleeve = roundCents(accountBalance * ACTIVE_SLEEVE_PERCENT);
  const maxContractsByOutlay = wholeUnitsWithin(activeSleeve, outlayPerContract);

  const maxContracts = Math.min(maxContractsByRisk, maxContractsByOutlay);
  const actualRiskPercent = (tradeRisk / accountBalance) * 100;

  const passed = maxContracts >= 1 && contracts <= maxContracts && roundCents(tradeRisk) <= maxRisk && roundCents(totalOutlay) <= activeSleeve;

  return {
    maxRisk,
    riskPerContract,
    sizingRiskPerContract,
    stopPercent: stopPct,
    maxContracts,
    maxContractsByRisk,
    maxContractsByOutlay,
    activeSleeve,
    actualRiskPercent,
    passed,
  };
}

// Live contract-cap preview for the Trade Plan step, before a full plan
// exists. Same rules as evaluateRisk (risk cap w/ structural stop, Active
// Sleeve cap, cents math) so the preview can never promise more contracts
// than the Risk Manager will then approve.
export function previewMaxContracts(
  accountBalance: number,
  riskPercent: number,
  stopPercent: number,
  entryPremium: number | null,
  riskPerContract: number | null
) {
  const maxRisk = calculateMaxRisk(accountBalance, riskPercent);
  const activeSleeve = roundCents(accountBalance * ACTIVE_SLEEVE_PERCENT);
  const outlayPerContract = entryPremium && entryPremium > 0 ? roundCents(entryPremium * OPTIONS_CONTRACT_MULTIPLIER) : null;
  const sizingRisk =
    riskPerContract && riskPerContract > 0
      ? roundCents(Math.max(riskPerContract, (outlayPerContract ?? 0) * (clampStopPercent(stopPercent) / 100)))
      : null;
  const maxContractsByRisk = sizingRisk ? wholeUnitsWithin(maxRisk, sizingRisk) : null;
  const maxContractsByOutlay = outlayPerContract ? wholeUnitsWithin(activeSleeve, outlayPerContract) : null;
  const maxContracts =
    maxContractsByRisk !== null && maxContractsByOutlay !== null
      ? Math.min(maxContractsByRisk, maxContractsByOutlay)
      : maxContractsByRisk ?? maxContractsByOutlay;
  return { maxRisk, activeSleeve, maxContractsByRisk, maxContractsByOutlay, maxContracts };
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

// Daytrade Engine's final call -- no composite 0-100 score (inventing new
// weights for a 4-question flow would be arbitrary), just a plain
// authorized/blocked verdict from the gates that still actually gate:
// Trade Gate (2/2), Risk Manager, and Execution Check. Setup Read and
// Trade Plan / R:R failing both already stop the submission earlier (see
// submitFastSession), same as the standard engine, so neither is repeated
// as a reason here.
export function evaluateFastAuthorization(
  gateScore: number,
  riskApproved: boolean,
  executionScore: number
) {
  const reasons: string[] = [];

  if (gateScore < 2) reasons.push("Trade Gate");
  if (!riskApproved) reasons.push("Risk Management");
  if (executionScore < 4) reasons.push("Execution");

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
