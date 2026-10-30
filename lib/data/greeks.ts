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

// 0DTE: what the Greeks do on expiration day, and especially in the last
// hour. Shown on /playbook/options and /playbook/zero-dte. Numbers in the
// examples are illustrative, not quotes.
export interface ZeroDteGreek {
  symbol: string;
  name: string;
  color: string;
  headline: string;
  lastHour: string;
  example: string;
  rule: string;
}

export const ZERO_DTE_GREEKS: ZeroDteGreek[] = [
  {
    symbol: "Γ",
    name: "Gamma",
    color: "secondary",
    headline: "Gamma is at its peak for near-the-money contracts on expiration day.",
    lastHour:
      "Delta can swing from 0.30 to 0.70 (or back to 0.10) on a move of less than a dollar in SPY. That's how a 0DTE contract goes +400% in minutes, and how it goes to almost zero just as fast.",
    example: "Illustrative: an ATM SPY call at $0.80 with 90 minutes left. SPY pushes $1.50 your way and it can trade $2.00+. Same push against you and it's $0.15.",
    rule: "Size so a fast reversal is survivable. The ladder exists because gamma gives back gains as quickly as it hands them out.",
  },
  {
    symbol: "Θ",
    name: "Theta",
    color: "loss",
    headline: "On a 0DTE contract, almost all of the premium is time value, and all of it is gone by the close.",
    lastHour:
      "Decay doesn't wait until the end of the day, but it gets brutal in the afternoon. If price sits still, an ATM contract can lose most of what's left in the final hour or two.",
    example: "Illustrative: a $1.20 ATM call at 1:00 PM with SPY flat can be ~$0.60 by 3:00 and ~$0.20 heading into the close.",
    rule: "A 0DTE trade that isn't working by mid-afternoon is losing to the clock even if it isn't hitting your stop. That's why entries close at 2:30 PM ET.",
  },
  {
    symbol: "Δ",
    name: "Delta",
    color: "primary",
    headline: "Out-of-the-money delta collapses through the day if price doesn't come to your strike.",
    lastHour:
      "A 0.20-delta call at 11:00 AM can be 0.05 by 3:00 PM with no move at all. Cheap OTM contracts late in the day are lottery tickets, not trades.",
    example: "Illustrative: a $0.25 OTM call needs a big, fast move to get paid. Most afternoons it just bleeds to $0.02.",
    rule: "Pick strikes near the money (~0.20–0.35 delta) at entry. Cheap is only good if it can actually move.",
  },
  {
    symbol: "V",
    name: "Vega",
    color: "caution",
    headline: "Vega is small on 0DTE: there's barely any time left for volatility to act on.",
    lastHour:
      "IV still spikes on news (Fed speakers, data at 10:00 AM, headlines), and that can puff up a contract for a few minutes, but direction and gamma dominate the P/L.",
    example: "A volatility spike can inflate premium briefly. Don't mistake that pop for the move you planned for.",
    rule: "Don't buy 0DTE right before a scheduled release hoping for IV. Trade the reaction, not the event.",
  },
];

export const ZERO_DTE_CLOSE_WARNINGS = [
  "Bid/ask spreads widen in the last 30 minutes. A contract that shows $0.40 may only fill at $0.30. Exit before the scramble.",
  "Never hold into the close. A call or put that finishes in the money can be auto-exercised into 100 shares per contract, which a small account can't cover; many brokers will force-close you first at a bad price.",
  "Flat by 3:45 PM ET. Whatever's left after that is a gamble on the final 15 minutes.",
];
