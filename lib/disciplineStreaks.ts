// Discipline streaks: progress meters that reward the boring habits, not
// P&L. Both are pure functions over the journal rows the dashboard already
// loads (lib/data/xrill-analytics-data.ts) -- no new tables.
//
//  - Journal Streak: consecutive most-recent CLOSED trades with a finished
//    review (why you exited, did the thesis play out, confidence after).
//    An unreviewed closed trade breaks it until you go back and review it.
//  - Plan Adherence: consecutive most-recent rule-based exits (hit target,
//    hit stop, wrong-if happened). An "Emotional / nerves" exit breaks it.
//    "Ran out of time" / "Other" / no exit reason neither count nor break.
//
// Neither streak is a win streak: a stop-out you took on plan counts.

import type { SessionOutcomeRow } from "@/lib/analytics";
import type { ExitReason } from "@/lib/thesis";

export const RULE_EXITS: ExitReason[] = ["target", "stop", "invalidation"];
export const BREAKING_EXITS: ExitReason[] = ["emotional"];

export interface StreakTier {
  at: number;
  name: string;
}

// Same ladder for both meters so the names mean the same thing everywhere.
export const STREAK_TIERS: StreakTier[] = [
  { at: 3, name: "Warming Up" },
  { at: 5, name: "Locked In" },
  { at: 10, name: "Machine" },
  { at: 20, name: "Unshakeable" },
  { at: 50, name: "Legend" },
];

export function tierFor(count: number) {
  let current: StreakTier | null = null;
  for (const t of STREAK_TIERS) if (count >= t.at) current = t;
  const next = STREAK_TIERS.find((t) => t.at > count) ?? null;
  const floor = current?.at ?? 0;
  const progress = next ? (count - floor) / (next.at - floor) : 1;
  return { current, next, progress: Math.max(0, Math.min(1, progress)) };
}

export function isClosed(r: SessionOutcomeRow) {
  return r.profit_loss !== null && r.profit_loss !== undefined;
}

// The review fields shipped on this date (migration 20261018). Trades
// closed before it never had a way to be reviewed, so the Journal Streak
// only looks at trades closed from here on instead of showing a backlog
// nobody could have filled in.
export const REVIEW_TRACKING_START = "2026-10-18";

export function closedAt(r: SessionOutcomeRow) {
  return r.closed_at ?? r.created_at;
}

export function countsForJournalStreak(r: SessionOutcomeRow) {
  return isClosed(r) && closedAt(r) >= REVIEW_TRACKING_START;
}

export function isReviewed(r: SessionOutcomeRow) {
  return !!r.exit_reason && !!r.thesis_result && r.confidence_post !== null && r.confidence_post !== undefined;
}

// Newest close first. closed_at is the outcome row's created_at; older
// rows without it fall back to when the session was opened.
function closedNewestFirst(rows: SessionOutcomeRow[]) {
  return rows
    .filter(isClosed)
    .sort((a, b) => closedAt(b).localeCompare(closedAt(a)));
}

// Current run counted from the newest item back, plus the best run ever.
function runs<T>(itemsNewestFirst: T[], verdict: (x: T) => "count" | "skip" | "break") {
  let current = 0;
  let currentOpen = true;
  let best = 0;
  let run = 0;
  for (const x of itemsNewestFirst) {
    const v = verdict(x);
    if (v === "skip") continue;
    if (v === "count") {
      run++;
      if (currentOpen) current++;
    } else {
      currentOpen = false;
      run = 0;
    }
    best = Math.max(best, run);
  }
  return { current, best };
}

export interface JournalStreak {
  current: number;
  best: number;
  closed: number;
  pendingReview: number; // closed trades still missing a review
}

export function journalStreak(rows: SessionOutcomeRow[]): JournalStreak {
  const closed = closedNewestFirst(rows).filter(countsForJournalStreak);
  const { current, best } = runs(closed, (r) => (isReviewed(r) ? "count" : "break"));
  return { current, best, closed: closed.length, pendingReview: closed.filter((r) => !isReviewed(r)).length };
}

export interface AdherenceBucket {
  trades: number;
  avgR: number | null; // average P&L in R (profit_loss / trade_risk)
}

export interface PlanAdherence {
  current: number;
  best: number;
  ruleExits: number;
  emotionalExits: number;
  rate: number | null; // rule / (rule + emotional), 0-100
  rule: AdherenceBucket;
  emotional: AdherenceBucket;
}

export const MIN_FOR_COMPARISON = 3;

function bucket(rows: SessionOutcomeRow[]): AdherenceBucket {
  const withR = rows.filter((r) => (r.trade_risk ?? 0) > 0);
  const avgR = withR.length
    ? Math.round((withR.reduce((s, r) => s + Number(r.profit_loss) / Number(r.trade_risk), 0) / withR.length) * 100) / 100
    : null;
  return { trades: rows.length, avgR };
}

export function planAdherence(rows: SessionOutcomeRow[]): PlanAdherence {
  const closed = closedNewestFirst(rows);
  const isRule = (r: SessionOutcomeRow) => RULE_EXITS.includes(r.exit_reason as ExitReason);
  const isBreak = (r: SessionOutcomeRow) => BREAKING_EXITS.includes(r.exit_reason as ExitReason);
  const { current, best } = runs(closed, (r) => (isRule(r) ? "count" : isBreak(r) ? "break" : "skip"));
  const rule = closed.filter(isRule);
  const emotional = closed.filter(isBreak);
  const judged = rule.length + emotional.length;
  return {
    current,
    best,
    ruleExits: rule.length,
    emotionalExits: emotional.length,
    rate: judged ? Math.round((rule.length / judged) * 100) : null,
    rule: bucket(rule),
    emotional: bucket(emotional),
  };
}
