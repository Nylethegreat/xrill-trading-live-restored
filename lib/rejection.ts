// Ported from the original XRILL Python CLI's xrill_rejection_analysis()
// (main.py). Never made it into the Streamlit web UI or the first pass of
// this port — the app captured `rejection_reason` on every blocked session
// but nothing ever read it back. This breaks that comma-separated reason
// string down by category and surfaces the single most common failure,
// exactly like the CLI did.

export type RejectionCategory =
  | "Daily Readiness"
  | "Trade Gate"
  | "Setup Quality"
  | "Risk Management"
  | "Execution"
  | "XRILL Score";

const CATEGORIES: RejectionCategory[] = [
  "Daily Readiness",
  "Trade Gate",
  "Setup Quality",
  "Risk Management",
  "Execution",
  "XRILL Score",
];

const COACH_MESSAGE: Record<RejectionCategory, { problem: string; advice: string }> = {
  "Daily Readiness": {
    problem: "Your most common problem is daily readiness.",
    advice: "Improve your mental state before considering a trade.",
  },
  "Trade Gate": {
    problem: "Your most common problem is market conditions.",
    advice: "Be more selective about when you trade.",
  },
  "Setup Quality": {
    problem: "Your most common problem is trade selection.",
    advice: "Wait for higher-quality setups.",
  },
  "Risk Management": {
    problem: "Your most common problem is position risk.",
    advice: "Reduce position size.",
  },
  Execution: {
    problem: "Your most common problem is execution discipline.",
    advice: "Focus on following your plan exactly.",
  },
  "XRILL Score": {
    problem: "Your overall trade quality is too low.",
    advice: "Only trade when the complete XRILL process is strong.",
  },
};

export interface RejectionSessionInput {
  trade_authorized: boolean | null;
  rejection_reason: string | null;
}

export interface RejectionAnalysis {
  totalSessions: number;
  authorizedSessions: number;
  blockedSessions: number;
  authorizationRate: number;
  blockRate: number;
  counts: { category: RejectionCategory; count: number }[];
  mostCommon: {
    category: RejectionCategory;
    count: number;
    percentOfBlocked: number;
    problem: string;
    advice: string;
  } | null;
}

export function analyzeRejections(sessions: RejectionSessionInput[]): RejectionAnalysis | null {
  const totalSessions = sessions.length;
  if (totalSessions === 0) return null;

  const counts: Record<RejectionCategory, number> = {
    "Daily Readiness": 0,
    "Trade Gate": 0,
    "Setup Quality": 0,
    "Risk Management": 0,
    Execution: 0,
    "XRILL Score": 0,
  };

  let authorizedSessions = 0;
  let blockedSessions = 0;

  for (const s of sessions) {
    if (s.trade_authorized) {
      authorizedSessions += 1;
      continue;
    }

    blockedSessions += 1;

    if (s.rejection_reason) {
      for (const reason of s.rejection_reason.split(", ")) {
        if ((CATEGORIES as string[]).includes(reason)) {
          counts[reason as RejectionCategory] += 1;
        }
      }
    }
  }

  const sortedCounts = CATEGORIES.map((category) => ({ category, count: counts[category] })).sort(
    (a, b) => b.count - a.count
  );

  let mostCommon: RejectionAnalysis["mostCommon"] = null;
  if (blockedSessions > 0) {
    const top = sortedCounts[0];
    if (top.count > 0) {
      const percentOfBlocked = (top.count / blockedSessions) * 100;
      mostCommon = {
        category: top.category,
        count: top.count,
        percentOfBlocked,
        problem: COACH_MESSAGE[top.category].problem,
        advice: COACH_MESSAGE[top.category].advice,
      };
    }
  }

  return {
    totalSessions,
    authorizedSessions,
    blockedSessions,
    authorizationRate: (authorizedSessions / totalSessions) * 100,
    blockRate: (blockedSessions / totalSessions) * 100,
    counts: sortedCounts,
    mostCommon,
  };
}
