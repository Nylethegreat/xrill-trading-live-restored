// Ported from the original XRILL Python CLI's xrill_intelligence() (main.py).
// This function existed and worked in the CLI version; the Streamlit port
// only ever got as far as a placeholder ("XRILL Intelligence / Coach module
// will be connected next"). This brings the real logic — trading profile,
// strongest/weakest score component, tiered observations, and a final
// recommendation — into the web app, unchanged in substance.

export interface XrillSessionForProfile {
  daily_score: number | null;
  trade_gate_score: number | null;
  setup_score: number | null;
  execution_score: number | null;
  trade_score: number | null;
  trade_authorized: boolean | null;
}

export type PerformanceArea = "Daily Readiness" | "Trade Gate" | "Setup Quality" | "Execution";

export interface TradingProfile {
  totalSessions: number;
  averageTradeScore: number;
  authorizationRate: number;
  areas: Record<PerformanceArea, { raw: number; max: number; percent: number }>;
  strongest: PerformanceArea;
  weakest: PerformanceArea;
  observations: string[];
  recommendation: string;
}

export function buildTradingProfile(sessions: XrillSessionForProfile[]): TradingProfile | null {
  const total = sessions.length;
  if (total === 0) return null;

  const sum = (fn: (s: XrillSessionForProfile) => number | null) =>
    sessions.reduce((acc, s) => acc + (fn(s) ?? 0), 0);

  const averageTradeScore = sum((s) => s.trade_score) / total;
  const averageDailyScore = sum((s) => s.daily_score) / total;
  const averageGateScore = sum((s) => s.trade_gate_score) / total;
  const averageSetupScore = sum((s) => s.setup_score) / total;
  const averageExecutionScore = sum((s) => s.execution_score) / total;

  const authorizedSessions = sessions.filter((s) => s.trade_authorized).length;
  const authorizationRate = (authorizedSessions / total) * 100;

  const areas: Record<PerformanceArea, { raw: number; max: number; percent: number }> = {
    "Daily Readiness": { raw: averageDailyScore, max: 4, percent: (averageDailyScore / 4) * 100 },
    "Trade Gate": { raw: averageGateScore, max: 5, percent: (averageGateScore / 5) * 100 },
    "Setup Quality": { raw: averageSetupScore, max: 25, percent: (averageSetupScore / 25) * 100 },
    Execution: { raw: averageExecutionScore, max: 5, percent: (averageExecutionScore / 5) * 100 },
  };

  const entries = Object.entries(areas) as [PerformanceArea, (typeof areas)[PerformanceArea]][];
  const strongest = entries.reduce((a, b) => (b[1].percent > a[1].percent ? b : a))[0];
  const weakest = entries.reduce((a, b) => (b[1].percent < a[1].percent ? b : a))[0];

  const observations: string[] = [];

  if (averageTradeScore >= 90) observations.push("🟢 Your average XRILL score is excellent.");
  else if (averageTradeScore >= 80) observations.push("🟢 Your average XRILL score is strong.");
  else if (averageTradeScore >= 70) observations.push("🟡 Your average XRILL score is acceptable.");
  else observations.push("🔴 Your average XRILL score is weak.");

  if (authorizationRate >= 80)
    observations.push("🟢 You are consistently meeting XRILL requirements.");
  else if (authorizationRate >= 60)
    observations.push("🟡 You are meeting XRILL requirements most of the time.");
  else observations.push("🔴 A large percentage of sessions are being blocked.");

  const focusArea: Record<PerformanceArea, string> = {
    "Daily Readiness": "⚠️ Focus Area: Mental readiness before trading.",
    "Trade Gate": "⚠️ Focus Area: Market conditions and trading environment.",
    "Setup Quality": "⚠️ Focus Area: Improve trade selection and setup quality.",
    Execution: "⚠️ Focus Area: Improve execution discipline.",
  };
  observations.push(focusArea[weakest]);

  let recommendation: string;
  if (averageTradeScore >= 90) recommendation = "Maintain your current process. Focus on consistency.";
  else if (averageTradeScore >= 80)
    recommendation = "Your process is strong. Focus on improving your weakest area.";
  else if (averageTradeScore >= 70) recommendation = "Be selective. Only take high-quality setups.";
  else recommendation = "Reduce trading activity. Focus on process improvement.";

  return {
    totalSessions: total,
    averageTradeScore,
    authorizationRate,
    areas,
    strongest,
    weakest,
    observations,
    recommendation,
  };
}
