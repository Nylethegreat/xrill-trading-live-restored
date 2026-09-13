// Ported from the original XRILL Python analytics engine (analytics.py).
// There it worked off a flat 37-field dataset from a single local SQLite
// table; here the same fields come from a LEFT JOIN of xrill_sessions and
// xrill_outcomes (one outcome per session, joined on session_id), scoped to
// the signed-in user. All formulas are kept identical to the Python source.

export interface SessionOutcomeRow {
  session_id: number;
  created_at: string;
  session_date: string | null;
  market_session: string | null;
  setup_type: string | null;
  time_of_day: string | null;
  ticker: string | null;
  direction: string | null;
  entry: number | null;
  stop: number | null;
  target: number | null;
  contracts: number | null;
  point_value: number | null;
  risk_points: number | null;
  reward_points: number | null;
  trade_risk: number | null;
  trade_reward: number | null;
  rr: number | null;
  max_risk: number | null;
  daily_score: number | null;
  trade_gate_score: number | null;
  setup_score: number | null;
  risk_approved: boolean | null;
  execution_score: number | null;
  trade_score: number | null;
  trade_authorized: boolean | null;
  rejection_reason: string | null;
  profit_loss: number | null;
  followed_plan: boolean | null;
  followed_exit_rules: boolean | null;
  emotion: string | null;
  lesson: string | null;
  exit_price: number | null;
  holding_minutes: number | null;
  risk_multiple: number | null;
  mfe: number | null;
  mae: number | null;
}

export interface GroupStats {
  sessions: number;
  completed: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  netPnl: number;
  averageTrade: number;
  averageR: number;
}

function emptyGroupStats(): GroupStats {
  return {
    sessions: 0,
    completed: 0,
    wins: 0,
    losses: 0,
    breakeven: 0,
    winRate: 0,
    netPnl: 0,
    averageTrade: 0,
    averageR: 0,
  };
}

// ---------------------------------------------------------------
// FILTERING HELPERS
// ---------------------------------------------------------------

export function getCompletedTrades(data: SessionOutcomeRow[]) {
  // A completed trade is a session with a non-null profit/loss — 0 is a
  // completed breakeven trade, not "no outcome yet".
  return data.filter((r) => r.profit_loss !== null && r.profit_loss !== undefined);
}

export function getAuthorizedTrades(data: SessionOutcomeRow[]) {
  return data.filter((r) => r.trade_authorized);
}

export function getWinningTrades(data: SessionOutcomeRow[]) {
  return getCompletedTrades(data).filter((r) => (r.profit_loss ?? 0) > 0);
}

export function getLosingTrades(data: SessionOutcomeRow[]) {
  return getCompletedTrades(data).filter((r) => (r.profit_loss ?? 0) < 0);
}

export function getBreakevenTrades(data: SessionOutcomeRow[]) {
  return getCompletedTrades(data).filter((r) => (r.profit_loss ?? 0) === 0);
}

// ---------------------------------------------------------------
// BASIC PERFORMANCE
// ---------------------------------------------------------------

export function calculateWinRate(data: SessionOutcomeRow[]) {
  const completed = getCompletedTrades(data);
  if (completed.length === 0) return 0;
  return (getWinningTrades(completed).length / completed.length) * 100;
}

export function calculateNetPnl(data: SessionOutcomeRow[]) {
  return getCompletedTrades(data).reduce((sum, r) => sum + (r.profit_loss ?? 0), 0);
}

export function calculateAverageTrade(data: SessionOutcomeRow[]) {
  const completed = getCompletedTrades(data);
  if (completed.length === 0) return 0;
  return calculateNetPnl(completed) / completed.length;
}

export function calculateAverageWinner(data: SessionOutcomeRow[]) {
  const winners = getWinningTrades(data);
  if (winners.length === 0) return 0;
  return winners.reduce((sum, r) => sum + (r.profit_loss ?? 0), 0) / winners.length;
}

export function calculateAverageLoser(data: SessionOutcomeRow[]) {
  const losers = getLosingTrades(data);
  if (losers.length === 0) return 0;
  return losers.reduce((sum, r) => sum + (r.profit_loss ?? 0), 0) / losers.length;
}

// ---------------------------------------------------------------
// PROFIT FACTOR / EXPECTANCY / AVERAGE R
// ---------------------------------------------------------------

export function calculateProfitFactor(data: SessionOutcomeRow[]) {
  const winners = getWinningTrades(data);
  const losers = getLosingTrades(data);
  const grossProfit = winners.reduce((sum, r) => sum + (r.profit_loss ?? 0), 0);
  const grossLoss = Math.abs(losers.reduce((sum, r) => sum + (r.profit_loss ?? 0), 0));
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

export function calculateExpectancy(data: SessionOutcomeRow[]) {
  const completed = getCompletedTrades(data);
  if (completed.length === 0) return 0;
  const winners = getWinningTrades(completed);
  const losers = getLosingTrades(completed);
  const winProbability = winners.length / completed.length;
  const lossProbability = losers.length / completed.length;
  const averageWin = calculateAverageWinner(completed);
  const averageLoss = Math.abs(calculateAverageLoser(completed));
  return winProbability * averageWin - lossProbability * averageLoss;
}

export function calculateAverageR(data: SessionOutcomeRow[]) {
  const completed = getCompletedTrades(data);
  const values = completed
    .map((r) => r.risk_multiple)
    .filter((v): v is number => v !== null && v !== undefined);
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

// ---------------------------------------------------------------
// EQUITY CURVE / MAX DRAWDOWN
// ---------------------------------------------------------------

export interface EquityPoint {
  tradeNumber: number;
  sessionId: number;
  createdAt: string;
  profitLoss: number;
  equity: number;
}

export function calculateEquityCurve(data: SessionOutcomeRow[]): EquityPoint[] {
  const completed = getCompletedTrades(data);
  let equity = 0;
  return completed.map((r, i) => {
    equity += r.profit_loss ?? 0;
    return {
      tradeNumber: i + 1,
      sessionId: r.session_id,
      createdAt: r.created_at,
      profitLoss: r.profit_loss ?? 0,
      equity,
    };
  });
}

export function calculateMaxDrawdown(data: SessionOutcomeRow[]) {
  const curve = calculateEquityCurve(data);
  let peak = 0;
  let maxDrawdown = 0;
  for (const point of curve) {
    if (point.equity > peak) peak = point.equity;
    const drawdown = peak - point.equity;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  return maxDrawdown;
}

// ---------------------------------------------------------------
// GENERIC GROUP PERFORMANCE (by ticker / direction / session / setup type)
// ---------------------------------------------------------------

export function groupPerformance(
  data: SessionOutcomeRow[],
  keyFn: (row: SessionOutcomeRow) => string | null
): Record<string, GroupStats> {
  const groups: Record<string, GroupStats> = {};
  const rowsByKey: Record<string, SessionOutcomeRow[]> = {};

  for (const row of data) {
    const raw = keyFn(row);
    const key = raw === null || raw.trim() === "" ? "UNKNOWN" : raw.trim();
    if (!groups[key]) groups[key] = emptyGroupStats();
    if (!rowsByKey[key]) rowsByKey[key] = [];
    rowsByKey[key].push(row);

    const stats = groups[key];
    stats.sessions += 1;

    if (row.profit_loss !== null && row.profit_loss !== undefined) {
      stats.completed += 1;
      const pnl = row.profit_loss;
      stats.netPnl += pnl;
      if (pnl > 0) stats.wins += 1;
      else if (pnl < 0) stats.losses += 1;
      else stats.breakeven += 1;
    }
  }

  for (const key of Object.keys(groups)) {
    const stats = groups[key];
    if (stats.completed > 0) {
      stats.winRate = (stats.wins / stats.completed) * 100;
      stats.averageTrade = stats.netPnl / stats.completed;
    }
    stats.averageR = calculateAverageR(rowsByKey[key]);
  }

  return groups;
}

export const calculateTickerPerformance = (data: SessionOutcomeRow[]) =>
  groupPerformance(data, (r) => r.ticker);
export const calculateDirectionPerformance = (data: SessionOutcomeRow[]) =>
  groupPerformance(data, (r) => r.direction);
export const calculateMarketSessionPerformance = (data: SessionOutcomeRow[]) =>
  groupPerformance(data, (r) => r.market_session);
export const calculateSetupTypePerformance = (data: SessionOutcomeRow[]) =>
  groupPerformance(data, (r) => r.setup_type);

// ---------------------------------------------------------------
// SCORE BUCKET PERFORMANCE
// ---------------------------------------------------------------

const SCORE_BUCKET_ORDER = ["90-100", "80-89", "70-79", "60-69", "0-59"] as const;

function scoreBucket(score: number | null) {
  const s = score ?? 0;
  if (s >= 90) return "90-100";
  if (s >= 80) return "80-89";
  if (s >= 70) return "70-79";
  if (s >= 60) return "60-69";
  return "0-59";
}

export function calculateScoreBucketPerformance(data: SessionOutcomeRow[]) {
  const buckets: Record<string, GroupStats> = {};
  for (const b of SCORE_BUCKET_ORDER) buckets[b] = emptyGroupStats();

  for (const row of data) {
    const bucket = scoreBucket(row.trade_score);
    const stats = buckets[bucket];
    stats.sessions += 1;
    if (row.profit_loss !== null && row.profit_loss !== undefined) {
      stats.completed += 1;
      const pnl = row.profit_loss;
      stats.netPnl += pnl;
      if (pnl > 0) stats.wins += 1;
      else if (pnl < 0) stats.losses += 1;
      else stats.breakeven += 1;
    }
  }

  for (const b of SCORE_BUCKET_ORDER) {
    const stats = buckets[b];
    if (stats.completed > 0) {
      stats.winRate = (stats.wins / stats.completed) * 100;
      stats.averageTrade = stats.netPnl / stats.completed;
    }
  }

  return SCORE_BUCKET_ORDER.map((bucket) => ({ bucket, ...buckets[bucket] }));
}

// ---------------------------------------------------------------
// RISK APPROVAL PERFORMANCE
// ---------------------------------------------------------------

export function calculateRiskApprovalPerformance(data: SessionOutcomeRow[]) {
  const result: Record<"approved" | "not_approved", GroupStats> = {
    approved: emptyGroupStats(),
    not_approved: emptyGroupStats(),
  };

  for (const row of data) {
    const key = row.risk_approved ? "approved" : "not_approved";
    const stats = result[key];
    stats.sessions += 1;
    if (row.profit_loss !== null && row.profit_loss !== undefined) {
      stats.completed += 1;
      const pnl = row.profit_loss;
      stats.netPnl += pnl;
      if (pnl > 0) stats.wins += 1;
      else if (pnl < 0) stats.losses += 1;
      else stats.breakeven += 1;
    }
  }

  for (const key of ["approved", "not_approved"] as const) {
    const stats = result[key];
    if (stats.completed > 0) {
      stats.winRate = (stats.wins / stats.completed) * 100;
      stats.averageTrade = stats.netPnl / stats.completed;
    }
  }

  return result;
}

// ---------------------------------------------------------------
// DISCIPLINE: PLAN / EXIT-RULE ADHERENCE
// ---------------------------------------------------------------

export interface AdherenceStats {
  count: number;
  completed: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnl: number;
  averageTrade: number;
}

function adherenceStats(rows: SessionOutcomeRow[]): AdherenceStats {
  const completed = getCompletedTrades(rows);
  return {
    count: rows.length,
    completed: completed.length,
    wins: getWinningTrades(rows).length,
    losses: getLosingTrades(rows).length,
    winRate: calculateWinRate(rows),
    netPnl: calculateNetPnl(rows),
    averageTrade: calculateAverageTrade(rows),
  };
}

export function calculatePlanAdherence(data: SessionOutcomeRow[]) {
  return {
    followed_plan: adherenceStats(data.filter((r) => r.followed_plan === true)),
    did_not_follow_plan: adherenceStats(data.filter((r) => r.followed_plan === false)),
  };
}

export function calculateExitRuleAdherence(data: SessionOutcomeRow[]) {
  return {
    followed_exit_rules: adherenceStats(data.filter((r) => r.followed_exit_rules === true)),
    did_not_follow_exit_rules: adherenceStats(data.filter((r) => r.followed_exit_rules === false)),
  };
}

// ---------------------------------------------------------------
// MFE / MAE / HOLDING TIME
// ---------------------------------------------------------------

export function calculateMfeMae(data: SessionOutcomeRow[]) {
  const completed = getCompletedTrades(data);
  const mfe = completed.map((r) => r.mfe).filter((v): v is number => v !== null && v !== undefined);
  const mae = completed.map((r) => r.mae).filter((v): v is number => v !== null && v !== undefined);
  return {
    averageMfe: mfe.length ? mfe.reduce((s, v) => s + v, 0) / mfe.length : 0,
    averageMae: mae.length ? mae.reduce((s, v) => s + v, 0) / mae.length : 0,
    maximumMfe: mfe.length ? Math.max(...mfe) : 0,
    maximumMae: mae.length ? Math.max(...mae) : 0,
  };
}

export function calculateHoldingTime(data: SessionOutcomeRow[]) {
  const completed = getCompletedTrades(data);
  const values = completed
    .map((r) => r.holding_minutes)
    .filter((v): v is number => v !== null && v !== undefined);
  if (values.length === 0) return { averageMinutes: 0, minimumMinutes: 0, maximumMinutes: 0 };
  return {
    averageMinutes: values.reduce((s, v) => s + v, 0) / values.length,
    minimumMinutes: Math.min(...values),
    maximumMinutes: Math.max(...values),
  };
}

// ---------------------------------------------------------------
// FULL SUMMARY
// ---------------------------------------------------------------

export function getAnalyticsSummary(data: SessionOutcomeRow[]) {
  const completed = getCompletedTrades(data);
  const winners = getWinningTrades(data);
  const losers = getLosingTrades(data);
  const breakeven = getBreakevenTrades(data);
  const authorized = getAuthorizedTrades(data);

  const avg = (fn: (r: SessionOutcomeRow) => number | null) => {
    const values = data.map(fn).filter((v): v is number => v !== null && v !== undefined);
    return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  };

  return {
    totalSessions: data.length,
    authorizedTrades: authorized.length,
    completedTrades: completed.length,
    winningTrades: winners.length,
    losingTrades: losers.length,
    breakevenTrades: breakeven.length,
    winRate: calculateWinRate(data),
    netPnl: calculateNetPnl(data),
    averageTrade: calculateAverageTrade(data),
    averageWinner: calculateAverageWinner(data),
    averageLoser: calculateAverageLoser(data),
    profitFactor: calculateProfitFactor(data),
    expectancy: calculateExpectancy(data),
    averageR: calculateAverageR(data),
    maxDrawdown: calculateMaxDrawdown(data),
    equityCurve: calculateEquityCurve(data),
    scoreBuckets: calculateScoreBucketPerformance(data),
    riskApproval: calculateRiskApprovalPerformance(data),
    directions: calculateDirectionPerformance(data),
    tickers: calculateTickerPerformance(data),
    marketSessions: calculateMarketSessionPerformance(data),
    setupTypes: calculateSetupTypePerformance(data),
    planAdherence: calculatePlanAdherence(data),
    exitRuleAdherence: calculateExitRuleAdherence(data),
    mfeMae: calculateMfeMae(data),
    holdingTime: calculateHoldingTime(data),
    avgDailyScore: avg((r) => r.daily_score),
    avgGateScore: avg((r) => r.trade_gate_score),
    avgSetupScore: avg((r) => r.setup_score),
    avgExecutionScore: avg((r) => r.execution_score),
    avgTradeScore: avg((r) => r.trade_score),
    avgTradeRisk: avg((r) => r.trade_risk),
    avgTradeReward: avg((r) => r.trade_reward),
    authorizationRate: data.length ? (authorized.length / data.length) * 100 : 0,
  };
}

export type AnalyticsSummary = ReturnType<typeof getAnalyticsSummary>;
