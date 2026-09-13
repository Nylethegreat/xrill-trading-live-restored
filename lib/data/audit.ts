// Weekly Performance Audit — manually updated by nyle each week (mirrors
// the format he already produces by hand). This is intentionally a static,
// hand-fed data file rather than an auto-generated analysis: turning raw
// xrill_outcomes rows into the "what you did right / wrong" prose write-up
// is a real feature on its own and out of scope for this pass — flagged
// separately, not silently skipped.
export interface WeeklyAudit {
  weekLabel: string; // "Sep 8 – Sep 11, 2026"
  metrics: { label: string; value: string }[];
  didRight: string[];
  didWrong: string[];
}

export const LATEST_AUDIT: WeeklyAudit = {
  weekLabel: "Sep 8 – Sep 11, 2026",
  metrics: [
    { label: "Total Trades", value: "25 (24 options, 1 equity sell)" },
    { label: "Win / Loss / Breakeven", value: "11 / 13 / 1" },
    { label: "Win Rate", value: "45.8% (excl. breakeven)" },
    { label: "Gross Profit", value: "+$468.30" },
    { label: "Gross Loss", value: "-$267.00" },
    { label: "Net Realized P&L", value: "+$201.30" },
    { label: "Profit Factor", value: "1.75" },
    { label: "Avg Win / Avg Loss", value: "+$42.57 / -$20.54" },
    { label: "Win/Loss Payoff Ratio", value: "2.07 : 1" },
  ],
  didRight: [
    "Asymmetric risk/reward execution — winners averaged more than double the losers; MSFT Put (+201%) and CRM Put (+264%) carried the week.",
    "Controlled loss sizing in dollar terms — most individual losses stayed capped between -$1 and -$28.",
    "High-conviction trend captures — directional put plays on tech weakness (MSFT, CRM, DELL, AMD) delivered outsized returns.",
  ],
  didWrong: [
    "Overtrading & forcing setups — 8 separate GOOGL call trades across three days for only 2 wins, 5 losses, 1 scratch.",
    "Letting short-DTE options expire to zero instead of honoring a stop-loss trigger on losing momentum positions.",
    "Choppy ticker hopping on Sep 9–10 across unrelated names, diluting focus away from higher-probability trend setups.",
  ],
};
