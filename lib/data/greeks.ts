// Content source: XRILL_Options_Fundamentals_Greeks.txt — kept verbatim in
// spirit (definitions, worked examples, key takeaways) for the public
// /playbook/options reference module.
export interface GreekDial {
  key: "delta" | "gamma" | "theta" | "vega" | "rho";
  symbol: string;
  name: string;
  tagline: string;
  range: string;
  definition: string;
  example: string;
  takeaway: string;
  color: string; // tailwind color token, matches tailwind.config.ts
}

export const GREEKS: GreekDial[] = [
  {
    key: "delta",
    symbol: "Δ",
    name: "Delta",
    tagline: "Direction & Speed",
    range: "Call: 0.00 → +1.00  ·  Put: -1.00 → 0.00",
    definition:
      "How much an option's premium is expected to change for every $1.00 move in the underlying stock. Also doubles as a rough real-time estimate of the probability the option finishes in-the-money — a 0.30 Delta option has roughly a 30% chance of expiring ITM.",
    example:
      "Stock at $100. A 0.50-Delta call trades for $3.00. Stock rallies $1 to $101 → the call gains ~$0.50, now $3.50.",
    takeaway: "Higher Delta = moves more like the stock. Lower Delta = cheaper, but needs a bigger move to pay off.",
    color: "primary",
  },
  {
    key: "gamma",
    symbol: "Γ",
    name: "Gamma",
    tagline: "Acceleration",
    range: "Highest for ATM options near expiration",
    definition:
      "The rate of change of Delta for every $1.00 move in the underlying. If Delta is speed, Gamma is acceleration — it's why short-dated, at-the-money options can swing violently in both directions.",
    example: "A call has Delta 0.50 and Gamma 0.10. Stock rallies $1 → Delta jumps from 0.50 to 0.60.",
    takeaway: "Peaks for at-the-money contracts close to expiry — that's exactly when price swings feel the sharpest.",
    color: "secondary",
  },
  {
    key: "theta",
    symbol: "Θ",
    name: "Theta",
    tagline: "The Ticking Clock",
    range: "Almost always negative for option buyers",
    definition:
      "How much value an option loses each day purely from the passage of time, all else equal. Buyers lose to Theta; sellers profit from it. Decay is not linear — it accelerates hard in the final 30–45 days before expiration.",
    example: "An option costs $2.00 with Theta of -0.05. One day passes, stock unchanged → premium drops to $1.95.",
    takeaway: "The clock is always running against a long option. Short-dated contracts bleed the fastest.",
    color: "loss",
  },
  {
    key: "vega",
    symbol: "V",
    name: "Vega",
    tagline: "Volatility Sensitivity",
    range: "PnL change per 1% move in Implied Volatility",
    definition:
      "How much an option's premium changes for every 1% change in Implied Volatility (IV). Higher IV inflates extrinsic value; lower IV crushes it — the dreaded post-earnings \"IV crush\" can wipe out gains even when the stock moved your way.",
    example: "A $4.00 option with Vega 0.15: IV +2% → premium +$0.30 (now $4.30). IV -2% → premium -$0.30 (now $3.70).",
    takeaway: "Beware buying options into binary events (earnings, FDA, Fed) — you can be right on direction and still lose to IV crush.",
    color: "caution",
  },
  {
    key: "rho",
    symbol: "ρ",
    name: "Rho",
    tagline: "Interest Rate Sensitivity",
    range: "Most relevant to LEAPS",
    definition:
      "How much an option's price moves for every 1% change in the risk-free interest rate. The least critical Greek for retail day/swing traders — it only becomes meaningful for long-dated LEAPS contracts.",
    example: "Negligible impact on a 30–45 DTE swing trade. Matters more the further out your expiration sits.",
    takeaway: "Safe to ignore for short-dated trading. Worth a glance only if you're holding LEAPS.",
    color: "blocked",
  },
];

export const GREEKS_CORE_IDEA =
  "Never trade an option based solely on the chart of the stock. Every contract is governed by Delta, Gamma, Theta, and Vega. Master the Greeks, and you master risk.";
