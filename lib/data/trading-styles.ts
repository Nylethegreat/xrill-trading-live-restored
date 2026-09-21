// Broad trading STYLES, defined by how long a position is typically held —
// a different lens than lib/data/strategies.ts, which catalogs specific
// entry techniques (MA Pullback, VWAP Reclaim, etc.). A style here can be
// executed with any number of those specific strategies.
export interface TradingStyle {
  name: string;
  holdingTime: string;
  definition: string;
}

export const TRADING_STYLES: TradingStyle[] = [
  {
    name: "Scalping",
    holdingTime: "Seconds to minutes",
    definition: "In and out fast, harvesting small, high-probability moves — relies on tight execution and low friction, since commissions/spread eat a bigger share of a small target.",
  },
  {
    name: "Day Trading",
    holdingTime: "Minutes to hours",
    definition: "Opened and closed within the same session — no position carried overnight, so no overnight gap risk.",
  },
  {
    name: "Swing Trading",
    holdingTime: "Days to weeks",
    definition: "Holding through the noise of individual sessions to capture a multi-day move — needs a wider stop and more patience than day trading.",
  },
  {
    name: "Position Trading",
    holdingTime: "Weeks to years",
    definition: "The longest holding horizon — built around a broader thesis, largely ignoring day-to-day price action once the position is on.",
  },
  {
    name: "Trend Following (Style)",
    holdingTime: "Weeks to months",
    definition: "Staying with an established directional move for as long as it keeps making higher highs (or lower lows) — the holding-time cousin of the Trend Following strategy in the Strategy Library above.",
  },
  {
    name: "Momentum",
    holdingTime: "Minutes to days",
    definition: "Riding a sharp, high-volume move while it's accelerating — exits get tighter as the move slows, since momentum trades can reverse fast.",
  },
  {
    name: "Mean Reversion",
    holdingTime: "Minutes to weeks",
    definition: "Betting price snaps back toward an average after stretching too far in one direction — the opposite assumption from trend following.",
  },
  {
    name: "Breakout (Style)",
    holdingTime: "Minutes to weeks",
    definition: "Entering as price clears a key level with force, on the idea that the move continues — the holding-time cousin of the specific breakout setups in the Strategy Library above.",
  },
  {
    name: "Arbitrage",
    holdingTime: "Milliseconds to minutes",
    definition: "Capturing a pricing gap between two related instruments or venues — typically the shortest-held style of all, since the gap itself is what closes.",
  },
];
