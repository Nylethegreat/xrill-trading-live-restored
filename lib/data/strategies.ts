// 20 Strategies Refresher — categorized setup library for /playbook/strategies.
// Source: 20_Trading_Strategies_Study_Guide.
//
// NOTE FOR NYLE: the category breakdown you gave totals 19 named setups
// (Trend 5, Breakout & Continuation 6, Reversal 4, VWAP 2, Context & Events
// 2), one short of the "20 Strategies" title. Built exactly to the 19 you
// listed — tell me the 20th and it's a one-line addition to this file.
export type StrategyCategory = "Trend" | "Breakout & Continuation" | "Reversal" | "VWAP" | "Context & Events";

export interface Strategy {
  name: string;
  category: StrategyCategory;
  bias: "Bullish" | "Bearish" | "Either";
}

export const STRATEGY_CATEGORIES: StrategyCategory[] = [
  "Trend",
  "Breakout & Continuation",
  "Reversal",
  "VWAP",
  "Context & Events",
];

export const STRATEGIES: Strategy[] = [
  // Trend
  { name: "Trend Following", category: "Trend", bias: "Either" },
  { name: "MA Pullback", category: "Trend", bias: "Either" },
  { name: "Momentum Continuation", category: "Trend", bias: "Either" },
  { name: "Higher High / Higher Low", category: "Trend", bias: "Bullish" },
  { name: "Lower High / Lower Low", category: "Trend", bias: "Bearish" },
  // Breakout & Continuation
  { name: "Breakout", category: "Breakout & Continuation", bias: "Either" },
  { name: "Breakout Retest", category: "Breakout & Continuation", bias: "Either" },
  { name: "Opening Range Breakout (ORB)", category: "Breakout & Continuation", bias: "Either" },
  { name: "Gap & Go", category: "Breakout & Continuation", bias: "Bullish" },
  { name: "Bull Flag", category: "Breakout & Continuation", bias: "Bullish" },
  { name: "Bear Flag", category: "Breakout & Continuation", bias: "Bearish" },
  // Reversal
  { name: "Support Bounce", category: "Reversal", bias: "Bullish" },
  { name: "Resistance Rejection", category: "Reversal", bias: "Bearish" },
  { name: "Gap Fill", category: "Reversal", bias: "Either" },
  { name: "Mean Reversion", category: "Reversal", bias: "Either" },
  // VWAP
  { name: "VWAP Reclaim", category: "VWAP", bias: "Bullish" },
  { name: "VWAP Rejection", category: "VWAP", bias: "Bearish" },
  // Context & Events
  { name: "Earnings Volatility", category: "Context & Events", bias: "Either" },
  { name: "Market Confirmation", category: "Context & Events", bias: "Either" },
];

// 10-Point Pre-Trade Scorecard
export interface ScorecardCriterion {
  key: string;
  label: string;
  points: number;
  hint: string;
}

export const SCORECARD_CRITERIA: ScorecardCriterion[] = [
  { key: "marketAligned", label: "Market Aligned", points: 2, hint: "Broader market/sector confirms your direction" },
  { key: "setupQuality", label: "Setup Quality", points: 2, hint: "Clean, textbook pattern — not a forced/marginal read" },
  { key: "srContext", label: "S/R Context", points: 2, hint: "Trading with a clear level, not into the middle of nowhere" },
  { key: "volume", label: "Volume", points: 1, hint: "Volume expansion confirms the move" },
  { key: "momentum", label: "Momentum", points: 1, hint: "Price action momentum supports the entry" },
  { key: "riskReward", label: "Risk/Reward", points: 2, hint: "Target offers at least 2x the defined stop" },
];

export const SCORECARD_MAX = SCORECARD_CRITERIA.reduce((sum, c) => sum + c.points, 0); // 10

export function scorecardGrade(score: number): { grade: string; tone: "good" | "info" | "caution" | "blocked" } {
  if (score >= 9) return { grade: "Very Strong", tone: "good" };
  if (score >= 7) return { grade: "Strong", tone: "info" };
  if (score >= 5) return { grade: "Mixed", tone: "caution" };
  return { grade: "Hard Pass", tone: "blocked" };
}
