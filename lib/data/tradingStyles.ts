// Trading Style = the holding horizon of a trade (how long you plan to be
// in it), separate from the Strategy, which is the specific setup. A
// Breakout strategy can be traded as a Scalp or a Swing -- the style says
// which. Picked in the Setup Read of both engines, saved to
// xrill_sessions.trading_style. Optional: it never gates a trade.

export type TradingStyleKey =
  | "scalping"
  | "day_trading"
  | "swing_trading"
  | "position_trading"
  | "trend_following"
  | "momentum"
  | "mean_reversion"
  | "breakout"
  | "arbitrage";

export interface TradingStyle {
  key: TradingStyleKey;
  name: string;
  horizon: string;
  definition: string;
}

export const TRADING_STYLES: TradingStyle[] = [
  {
    key: "scalping",
    name: "Scalping",
    horizon: "Seconds to minutes",
    definition:
      "In and out fast, harvesting small, high-probability moves — relies on tight execution and low friction, since commissions/spread eat a bigger share of a small target.",
  },
  {
    key: "day_trading",
    name: "Day Trading",
    horizon: "Minutes to hours",
    definition:
      "Opened and closed within the same session — no position carried overnight, so no overnight gap risk.",
  },
  {
    key: "swing_trading",
    name: "Swing Trading",
    horizon: "Days to weeks",
    definition:
      "Holding through the noise of individual sessions to capture a multi-day move — needs a wider stop and more patience than day trading.",
  },
  {
    key: "position_trading",
    name: "Position Trading",
    horizon: "Weeks to years",
    definition:
      "The longest holding horizon — built around a broader thesis, largely ignoring day-to-day price action once the position is on.",
  },
  {
    key: "trend_following",
    name: "Trend Following (Style)",
    horizon: "Weeks to months",
    definition:
      "Staying with an established directional move for as long as it keeps making higher highs (or lower lows) — the holding-time cousin of the Trend Following strategy in the Strategy Library.",
  },
  {
    key: "momentum",
    name: "Momentum",
    horizon: "Minutes to days",
    definition:
      "Riding a sharp, high-volume move while it's accelerating — exits get tighter as the move slows, since momentum trades can reverse fast.",
  },
  {
    key: "mean_reversion",
    name: "Mean Reversion",
    horizon: "Minutes to weeks",
    definition:
      "Betting price snaps back toward an average after stretching too far in one direction — the opposite assumption from trend following.",
  },
  {
    key: "breakout",
    name: "Breakout (Style)",
    horizon: "Minutes to weeks",
    definition:
      "Entering as price clears a key level with force, on the idea that the move continues — the holding-time cousin of the specific breakout setups in the Strategy Library.",
  },
  {
    key: "arbitrage",
    name: "Arbitrage",
    horizon: "Milliseconds to minutes",
    definition:
      "Capturing a pricing gap between two related instruments or venues — typically the shortest-held style of all, since the gap itself is what closes.",
  },
];

export const TRADING_STYLE_KEYS = TRADING_STYLES.map((s) => s.key);

export function getTradingStyle(key: string | null | undefined) {
  return TRADING_STYLES.find((s) => s.key === key) ?? null;
}

export function isTradingStyleKey(v: unknown): v is TradingStyleKey {
  return typeof v === "string" && (TRADING_STYLE_KEYS as string[]).includes(v);
}

export function tradingStyleLabel(key: string | null | undefined) {
  return getTradingStyle(key)?.name ?? null;
}
