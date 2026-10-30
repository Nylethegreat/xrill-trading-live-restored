// Weekly Discipline Board scoring. Pure functions, no queries. Ranks
// habits, never P&L: a planned stop-out scores the same as a planned
// target. The week runs Monday 00:00 ET through Sunday.

import type { SessionOutcomeRow } from "@/lib/analytics";
import {
  BREAKING_EXITS,
  RULE_EXITS,
  closedAt,
  countsForJournalStreak,
  isClosed,
  isReviewed,
  journalStreak,
  planAdherence,
} from "@/lib/disciplineStreaks";
import { countsAsTrade } from "@/lib/tradeCap";
import { etDate } from "@/lib/zeroDte";
import type { ExitReason } from "@/lib/thesis";

export const POINTS = {
  ruleExit: 3,
  reviewed: 2,
  dayWithinCap: 1,
  emotionalExit: -3,
  skippedEngine: -2,
  dayOverCap: -2,
} as const;

export const POINT_RULES: { label: string; points: number }[] = [
  { label: "Exit on a rule (target, stop, or wrong-if)", points: POINTS.ruleExit },
  { label: "Closed trade fully reviewed", points: POINTS.reviewed },
  { label: "Trading day under your cap", points: POINTS.dayWithinCap },
  { label: "Emotional exit", points: POINTS.emotionalExit },
  { label: "Trade that skipped the engine", points: POINTS.skippedEngine },
  { label: "Day over your cap", points: POINTS.dayOverCap },
];

const ET_WEEKDAY = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" });
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// YYYY-MM-DD of the Monday (ET) of the week containing `d`.
export function weekStartET(d: Date = new Date()): string {
  const offset = DAYS.indexOf(ET_WEEKDAY.format(d));
  const [y, m, day] = etDate(d).split("-").map(Number);
  const monday = new Date(Date.UTC(y, m - 1, day - Math.max(0, offset)));
  return monday.toISOString().slice(0, 10);
}

function addDays(ymd: string, n: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function closedOnET(r: SessionOutcomeRow) {
  return etDate(new Date(closedAt(r)));
}

export interface WeekScore {
  weekStart: string;
  points: number;
  ruleExits: number;
  emotionalExits: number;
  reviewed: number;
  skippedEngine: number;
  daysWithinCap: number;
  daysOverCap: number;
  trades: number;
}

// Score one week. Exits and reviews count by the day the trade was
// closed; trades and cap days count by the session's trading date.
// `cap` is the member's current cap (applied to every day of the week).
export function scoreWeek(rows: SessionOutcomeRow[], weekStart: string, cap: number): WeekScore {
  const weekEnd = addDays(weekStart, 7);
  const inWeek = (ymd: string | null | undefined) => !!ymd && ymd >= weekStart && ymd < weekEnd;

  const closed = rows.filter((r) => isClosed(r) && inWeek(closedOnET(r)));
  const ruleExits = closed.filter((r) => RULE_EXITS.includes(r.exit_reason as ExitReason)).length;
  const emotionalExits = closed.filter((r) => BREAKING_EXITS.includes(r.exit_reason as ExitReason)).length;
  const reviewed = closed.filter((r) => countsForJournalStreak(r) && isReviewed(r)).length;

  const trades = rows.filter((r) => inWeek(r.session_date) && countsAsTrade(r));
  const skippedEngine = trades.filter((r) => r.logged_after).length;
  const perDay = new Map<string, number>();
  for (const t of trades) perDay.set(t.session_date!, (perDay.get(t.session_date!) ?? 0) + 1);
  let daysWithinCap = 0;
  let daysOverCap = 0;
  for (const n of perDay.values()) {
    if (n > cap) daysOverCap++;
    else daysWithinCap++;
  }

  const points =
    ruleExits * POINTS.ruleExit +
    reviewed * POINTS.reviewed +
    daysWithinCap * POINTS.dayWithinCap +
    emotionalExits * POINTS.emotionalExit +
    skippedEngine * POINTS.skippedEngine +
    daysOverCap * POINTS.dayOverCap;

  return { weekStart, points, ruleExits, emotionalExits, reviewed, skippedEngine, daysWithinCap, daysOverCap, trades: trades.length };
}

// Best completed week before `currentWeekStart` -- the "past you" ghost.
export function bestPastWeek(rows: SessionOutcomeRow[], currentWeekStart: string, cap: number): WeekScore | null {
  const weeks = new Set<string>();
  for (const r of rows) {
    if (r.session_date) weeks.add(weekStartET(new Date(`${r.session_date}T16:00:00Z`)));
    if (isClosed(r)) weeks.add(weekStartET(new Date(closedAt(r))));
  }
  let best: WeekScore | null = null;
  for (const w of weeks) {
    if (w >= currentWeekStart) continue;
    const s = scoreWeek(rows, w, cap);
    if (s.trades === 0 && s.ruleExits + s.emotionalExits === 0) continue;
    if (!best || s.points > best.points) best = s;
  }
  return best;
}

export interface BoardRow extends WeekScore {
  userId: string;
  name: string;
  planStreak: number;
  journalStreak: number;
  isViewer: boolean;
  public: boolean;
}

export function boardRow(opts: {
  userId: string;
  name: string;
  rows: SessionOutcomeRow[];
  cap: number;
  weekStart: string;
  isViewer: boolean;
  public: boolean;
}): BoardRow {
  return {
    ...scoreWeek(opts.rows, opts.weekStart, opts.cap),
    userId: opts.userId,
    name: opts.name,
    planStreak: planAdherence(opts.rows).current,
    journalStreak: journalStreak(opts.rows).current,
    isViewer: opts.isViewer,
    public: opts.public,
  };
}

// Points, then the longer Plan Adherence streak, then fewer emotional exits.
export function rankBoard(rows: BoardRow[]): BoardRow[] {
  return [...rows].sort(
    (a, b) => b.points - a.points || b.planStreak - a.planStreak || a.emotionalExits - b.emotionalExits || a.name.localeCompare(b.name)
  );
}
