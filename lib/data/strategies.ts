// 20 Strategies Refresher — categorized setup library for /playbook/strategies
// and the Glossary's Strategy Library section (single source of truth for both).
// Source: 20_Trading_Strategies_Study_Guide.
//
// Reconciled with Nyle's full category breakdown (Trend 5, Breakout &
// Continuation 6, Reversal 4, VWAP 2, Context & Events 2 incl. Market
// Confirmation) — 19 named setups total. "20 Strategies" is the study
// guide's own title; the roster itself is exactly what he listed.
export type StrategyCategory = "Trend" | "Breakout & Continuation" | "Reversal" | "VWAP" | "Context & Events";

export interface Strategy {
  name: string;
  category: StrategyCategory;
  bias: "Bullish" | "Bearish" | "Either";
  definition: string;
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
  {
    name: "Trend Following",
    category: "Trend",
    bias: "Either",
    definition: "Trading in the direction of an established trend — buying dips in an uptrend or selling rallies in a downtrend — rather than trying to call a top or bottom.",
  },
  {
    name: "MA Pullback",
    category: "Trend",
    bias: "Either",
    definition: "Entering when price pulls back to a key moving average (e.g. the 9 or 21 EMA) inside an existing trend, using the average as dynamic support/resistance.",
  },
  {
    name: "Momentum Continuation",
    category: "Trend",
    bias: "Either",
    definition: "Joining a move that's already accelerating with strong volume and momentum, betting the current thrust keeps going rather than reverses.",
  },
  {
    name: "Higher High / Higher Low",
    category: "Trend",
    bias: "Bullish",
    definition: "The textbook definition of an uptrend in price structure — each swing high and swing low prints above the last one. Confirms bullish trend alignment.",
  },
  {
    name: "Lower High / Lower Low",
    category: "Trend",
    bias: "Bearish",
    definition: "The mirror image for downtrends — each swing high and swing low prints below the last one, confirming bearish trend alignment.",
  },
  // Breakout & Continuation
  {
    name: "Breakout",
    category: "Breakout & Continuation",
    bias: "Either",
    definition: "Entering as price pushes through a well-defined resistance (or support) level with expanding volume, betting the level gives way and price runs.",
  },
  {
    name: "Breakout Retest",
    category: "Breakout & Continuation",
    bias: "Either",
    definition: "Waiting for price to break a level, then pull back to retest it as new support/resistance before entering — trades the confirmation, not the first spike.",
  },
  {
    name: "Opening Range Breakout (ORB)",
    category: "Breakout & Continuation",
    bias: "Either",
    definition: "Marking the high/low of the first 5–15 minutes of the session, then trading a break of that range as the day's initial directional signal.",
  },
  {
    name: "Gap & Go",
    category: "Breakout & Continuation",
    bias: "Bullish",
    definition: "A stock gaps up pre-market on news or catalyst and continues higher after the open — entering with the gap's momentum rather than fading it.",
  },
  {
    name: "Bull Flag",
    category: "Breakout & Continuation",
    bias: "Bullish",
    definition: "A sharp upward move (the pole) followed by a tight, shallow pullback (the flag) — entering on a break back to the upside as the pause resolves.",
  },
  {
    name: "Bear Flag",
    category: "Breakout & Continuation",
    bias: "Bearish",
    definition: "The bearish mirror of a bull flag — a sharp drop followed by a brief upward consolidation, entering short as price breaks back down.",
  },
  // Reversal
  {
    name: "Support Bounce",
    category: "Reversal",
    bias: "Bullish",
    definition: "Buying as price reaches a well-established support level and shows signs of holding — betting the floor holds one more time.",
  },
  {
    name: "Resistance Rejection",
    category: "Reversal",
    bias: "Bearish",
    definition: "Shorting as price reaches a well-established resistance level and stalls — betting the ceiling holds and price turns back down.",
  },
  {
    name: "Gap Fill",
    category: "Reversal",
    bias: "Either",
    definition: "Trading the tendency for a price gap (up or down) to eventually retrace back toward where it started — fading the gap rather than following it.",
  },
  {
    name: "Mean Reversion",
    category: "Reversal",
    bias: "Either",
    definition: "Betting that price has stretched too far, too fast from its average and is due to snap back — the opposite instinct from trend following.",
  },
  // VWAP
  {
    name: "VWAP Reclaim",
    category: "VWAP",
    bias: "Bullish",
    definition: "Price dips below VWAP intraday, then reclaims it — entering long as VWAP flips from resistance back to support.",
  },
  {
    name: "VWAP Rejection",
    category: "VWAP",
    bias: "Bearish",
    definition: "Price rallies up into VWAP from below and gets rejected — entering short as VWAP holds as resistance.",
  },
  // Context & Events
  {
    name: "Earnings Volatility",
    category: "Context & Events",
    bias: "Either",
    definition: "Trading the outsized price and implied-volatility swings around an earnings release — a distinct, higher-risk regime from normal price action (watch for IV crush post-release).",
  },
  {
    name: "Market Confirmation",
    category: "Context & Events",
    bias: "Either",
    definition: "Only taking an individual-stock setup when the broader index or sector structure confirms the same directional thesis — a single-name signal is far weaker when it's fighting the tape.",
  },
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
