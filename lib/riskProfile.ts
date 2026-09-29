// The account-level risk hierarchy, in one place. Every number the Account
// Settings form shows, the server action saves, and the Risk Manager /
// daily-loss lock enforces comes from here, so they can never disagree.
//
// The hierarchy (smallest to largest), always true after normalization:
//
//   Max Trade Loss  <  Daily Loss Limit  <=  Active Sleeve  <  Balance
//   (risk % x bal)     (1.5x - N x trade)     (60% of bal)
//
// and the 40% Idle Sleeve is never inside any of them.
//
// Worked example, $280 balance, 22% risk per trade, 40% structural stop:
//   Active Sleeve  $168.00   Idle Sleeve  $112.00
//   Max Trade Loss $61.60    (22% of $280)
//   Max position   $154.00   ($61.60 / 40% -- if the premium drops 40%, you lose exactly $61.60)
//   Daily Loss     $92.40 floor (1.5x), $123.20 default (2x), $168.00 ceiling (Active Sleeve)

export const ACTIVE_SLEEVE_PERCENT = 0.6;
export const IDLE_SLEEVE_PERCENT = 0.4;

// Risk per trade % is bounded by the Dynamic Risk Tiering Matrix
// (lib/data/riskTiers.ts): Aggressive tops out at 22%.
export const MIN_RISK_PERCENT = 0.5;
export const MAX_RISK_PERCENT = 22;

// Structural stop: how far an option's premium may fall before you're out.
export const DEFAULT_STOP_PERCENT = 40;
export const MIN_STOP_PERCENT = 5;
export const MAX_STOP_PERCENT = 100;

// Daily Loss Limit as a multiple of one Max Trade Loss.
export const DAILY_LOSS_MIN_MULTIPLE = 1.5;
export const DAILY_LOSS_DEFAULT_MULTIPLE = 2;

/** Round to cents, killing float noise like 0.10 - 0.06 = 0.04000000000000001. */
export function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * How many whole units of `perUnit` fit in `budget`, computed in cents so
 * float noise can't turn an exact 50 into 49 ($200 / $4.000000000000001).
 */
export function wholeUnitsWithin(budget: number, perUnit: number): number {
  const b = Math.round(budget * 100);
  const u = Math.round(perUnit * 100);
  if (u <= 0 || b <= 0) return 0;
  return Math.floor(b / u);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clampRiskPercent(value: number | null | undefined): number {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return 1;
  return clamp(v, MIN_RISK_PERCENT, MAX_RISK_PERCENT);
}

export function clampStopPercent(value: number | null | undefined): number {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return DEFAULT_STOP_PERCENT;
  return clamp(v, MIN_STOP_PERCENT, MAX_STOP_PERCENT);
}

export interface RiskProfile {
  balance: number;
  riskPercent: number; // clamped
  stopPercent: number; // clamped
  activeSleeve: number;
  idleSleeve: number;
  maxTradeLoss: number;
  /** Largest premium outlay whose loss at the structural stop equals maxTradeLoss (never above the Active Sleeve). */
  maxPositionAtStop: number;
  dailyLossFloor: number;
  dailyLossDefault: number;
  dailyLossCeiling: number;
}

export function computeRiskProfile(input: {
  balance: number;
  riskPercent: number | null | undefined;
  stopPercent?: number | null;
}): RiskProfile {
  const balance = Math.max(0, Number(input.balance) || 0);
  const riskPercent = clampRiskPercent(input.riskPercent);
  const stopPercent = clampStopPercent(input.stopPercent);

  const activeSleeve = roundCents(balance * ACTIVE_SLEEVE_PERCENT);
  const idleSleeve = roundCents(balance - activeSleeve);
  const maxTradeLoss = roundCents(balance * (riskPercent / 100));
  const maxPositionAtStop = roundCents(Math.min(maxTradeLoss / (stopPercent / 100), activeSleeve));

  // With risk capped at 22%, 1.5x (33%) and 2x (44%) of balance always sit
  // under the 60% Active Sleeve, so floor <= default <= ceiling holds.
  const dailyLossCeiling = activeSleeve;
  const dailyLossFloor = roundCents(Math.min(maxTradeLoss * DAILY_LOSS_MIN_MULTIPLE, dailyLossCeiling));
  const dailyLossDefault = roundCents(Math.min(maxTradeLoss * DAILY_LOSS_DEFAULT_MULTIPLE, dailyLossCeiling));

  return {
    balance,
    riskPercent,
    stopPercent,
    activeSleeve,
    idleSleeve,
    maxTradeLoss,
    maxPositionAtStop,
    dailyLossFloor,
    dailyLossDefault,
    dailyLossCeiling,
  };
}

/**
 * Bind a user-entered Daily Loss Limit into [1.5x max trade loss, Active
 * Sleeve]. Blank/invalid input falls back to the 2x default.
 */
export function normalizeDailyLossLimit(
  input: number | null | undefined,
  profile: RiskProfile
): { value: number; adjusted: "raised" | "lowered" | "defaulted" | null } {
  const v = Number(input);
  if (input === null || input === undefined || !Number.isFinite(v) || v <= 0) {
    return { value: profile.dailyLossDefault, adjusted: "defaulted" };
  }
  if (v < profile.dailyLossFloor) return { value: profile.dailyLossFloor, adjusted: "raised" };
  if (v > profile.dailyLossCeiling) return { value: profile.dailyLossCeiling, adjusted: "lowered" };
  return { value: roundCents(v), adjusted: null };
}

/**
 * The Daily Loss Limit actually enforced, whatever is stored. Protects the
 * hierarchy for rows saved before these rules existed, or left stale after
 * a balance change elsewhere (e.g. the dashboard's Double-Up Ladder).
 */
export function effectiveDailyLossLimit(account: {
  balance?: number | null;
  risk_percent?: number | null;
  stop_loss_percent?: number | null;
  daily_loss_limit?: number | null;
}): number {
  const profile = computeRiskProfile({
    balance: account.balance ?? 0,
    riskPercent: account.risk_percent,
    stopPercent: account.stop_loss_percent,
  });
  if (profile.balance <= 0) return Math.max(0, Number(account.daily_loss_limit) || 0);
  return normalizeDailyLossLimit(account.daily_loss_limit, profile).value;
}
