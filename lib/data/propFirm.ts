// Topstep-style Combine & Prop Blueprint — /playbook/prop-firm.
// $50K figures are sourced directly from Master_Trading_Blueprint_XRILL
// (the actual account nyle is running); $100K/$150K are the proportional
// tiers as specified.
export interface PropTier {
  size: 50_000 | 100_000 | 150_000;
  label: string;
  profitTarget: number;
  maxLossLimit: number; // MLL, calculated end-of-day
  consistencyCap: number; // 50% rule — max single-day profit counted toward target
  dailyHardStop: number; // negative number, e.g. -400
  sizing: string;
}

export const PROP_TIERS: PropTier[] = [
  {
    size: 50_000,
    label: "$50K Combine",
    profitTarget: 3_000,
    maxLossLimit: 2_000,
    consistencyCap: 1_500,
    dailyHardStop: -400,
    sizing: "2–5 Micro contracts (MNQ/MES)",
  },
  {
    size: 100_000,
    label: "$100K Combine",
    profitTarget: 6_000,
    maxLossLimit: 3_000,
    consistencyCap: 3_000,
    dailyHardStop: -800,
    sizing: "4–8 Micro contracts (MNQ/MES)",
  },
  {
    size: 150_000,
    label: "$150K Combine",
    profitTarget: 9_000,
    maxLossLimit: 4_500,
    consistencyCap: 4_500,
    dailyHardStop: -1_200,
    sizing: "6–10 Micros, blending in Minis (MNQ→NQ / MES→ES) only after the XFA buffer is built",
  },
];

export interface PropPhase {
  phase: 1 | 2 | 3;
  title: string;
  points: string[];
}

export const PROP_PHASES: PropPhase[] = [
  {
    phase: 1,
    title: "The Combine",
    points: [
      "Trade exclusively in Micro contracts until the profit buffer reaches +30% of the profit target.",
      "Aim for 4–6 consistent winning days instead of forcing it in 1–2 volatile sessions.",
      "Watch the 50% Consistency Rule — exceeding the single-day cap on profit doesn't get counted twice toward your target, so don't let one green day carry the whole Combine.",
    ],
  },
  {
    phase: 2,
    title: "Express Funded Account (XFA)",
    points: [
      "The starting account balance equals your Max Loss Limit threshold — there's no cushion on day one.",
      "Don't scale size immediately upon funding; target a healthy profit cushion before risking over 0.5% per trade.",
      "Protect unrealized intraday gains — never let a green trade turn into a red trailing drawdown.",
    ],
  },
  {
    phase: 3,
    title: "Payout Qualification",
    points: [
      "Accumulate 5 winning days with at least +$150 net PnL each.",
      "Request up to 50% of the account balance per withdrawal window.",
      "After a payout, the MLL locks permanently at the starting baseline — manage your buffer with that in mind.",
    ],
  },
];

export const PREMARKET_CHECKLIST = [
  "Mark Previous Day High (PDH), Previous Day Low (PDL), and Asian/London session highs and lows.",
  "Check the economic calendar for high-impact releases (CPI, FOMC, NFP, PPI). Never hold open positions through a red-folder drop.",
  "Fixed stop-loss placed immediately on entry — no exceptions.",
  "Minimum 1:2 to 1:2.5 risk-to-reward target on every trade.",
  "Stop moved to breakeven only after reaching 1R profit.",
];

export function shutdownRules(tier: PropTier) {
  return [
    `2 consecutive losses (${tier.dailyHardStop.toLocaleString()}): close the platform for the day. No revenge trading.`,
    `Daily profit target reached: flatten positions, lock the gain, and log it toward your ${tier.consistencyCap.toLocaleString()}-cap consistency requirement.`,
  ];
}
