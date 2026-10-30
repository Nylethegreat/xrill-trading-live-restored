// The 0DTE lane: rules for options that expire the same day they're
// opened. Pure and client-safe -- the wizards use it to show the exit
// ladder and the clock, and app/session/actions.ts re-checks the same
// rules server-side before a 0DTE session can be authorized.
//
// Why a separate lane: 0DTE is where multiple contracts actually matter.
// One contract is all-or-nothing, so every runner turns into a nerve test.
// Two or more lets you pay back the cost early and hold the rest for free.

// No new 0DTE entries at or after 2:30 PM ET; be flat by 3:45 PM ET.
// Theta and gamma both go vertical in the last hour (see lib/data/greeks.ts).
export const ZERO_DTE_ENTRY_CUTOFF_MIN = 14 * 60 + 30;
export const ZERO_DTE_FLAT_BY_MIN = 15 * 60 + 45;
export const ZERO_DTE_MARKET_OPEN_MIN = 9 * 60 + 30;
export const ZERO_DTE_DAILY_MAX = 2;

const ET_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const ET_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function etDate(d: Date = new Date()) {
  return ET_DATE.format(d);
}

// Minutes since midnight, US Eastern.
export function etMinutes(d: Date = new Date()) {
  const parts = ET_TIME.formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return (h % 24) * 60 + m;
}

export function formatEtMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function isZeroDte(expiration: string | null | undefined, today: string = etDate()) {
  return !!expiration && expiration === today;
}

export type ClockState = "premarket" | "open" | "cutoff" | "flatten";

export function zeroDteClock(min: number = etMinutes()): { state: ClockState; minutesToCutoff: number } {
  const minutesToCutoff = ZERO_DTE_ENTRY_CUTOFF_MIN - min;
  if (min < ZERO_DTE_MARKET_OPEN_MIN) return { state: "premarket", minutesToCutoff };
  if (min < ZERO_DTE_ENTRY_CUTOFF_MIN) return { state: "open", minutesToCutoff };
  if (min < ZERO_DTE_FLAT_BY_MIN) return { state: "cutoff", minutesToCutoff };
  return { state: "flatten", minutesToCutoff };
}

export interface LadderStep {
  contracts: number;
  sellAt: number | null; // premium; null = runner (trailed, no fixed target)
  gainPct: number | null;
  label: string;
  note: string;
}

export interface ExitLadder {
  steps: LadderStep[];
  canTrim: boolean;
  costCoveredAfterStep1: boolean;
  totalCost: number; // dollars
  step1Proceeds: number; // dollars
}

// Pay back the cost first, then let the rest run.
//  - Sell ceil(N/2) at +100% (2x entry). That returns at least the full
//    cost of all N contracts, so the trade can't lose money after that
//    fill (fees aside).
//  - If 2+ are left, sell one more at +200% (3x entry).
//  - Whatever remains is the runner: trailed, never sold on a feeling.
export function exitLadder(entry: number, contracts: number): ExitLadder | null {
  if (!(entry > 0) || !(contracts >= 1) || !Number.isInteger(contracts)) return null;
  const totalCost = round2(entry * 100 * contracts);

  if (contracts === 1) {
    return {
      steps: [
        {
          contracts: 1,
          sellAt: round2(entry * 2),
          gainPct: 100,
          label: "All-or-nothing",
          note: "One contract can't be trimmed. Either take your planned target or size to 2+ cheaper contracts so you can pay yourself back and run the rest.",
        },
      ],
      canTrim: false,
      costCoveredAfterStep1: false,
      totalCost,
      step1Proceeds: round2(entry * 2 * 100),
    };
  }

  const first = Math.ceil(contracts / 2);
  let left = contracts - first;
  const steps: LadderStep[] = [
    {
      contracts: first,
      sellAt: round2(entry * 2),
      gainPct: 100,
      label: "Pay back the cost",
      note: "After this fill the trade can't lose money. Move the runner's stop to breakeven.",
    },
  ];
  if (left >= 2) {
    steps.push({
      contracts: 1,
      sellAt: round2(entry * 3),
      gainPct: 200,
      label: "Bank a profit",
      note: "Locks in a real win on top of your cost.",
    });
    left -= 1;
  }
  steps.push({
    contracts: left,
    sellAt: null,
    gainPct: null,
    label: "Runner",
    note: "Trail it under structure (prior 5-min low for calls, high for puts). It exits on the trail or by 3:45 PM, not on nerves.",
  });

  const step1Proceeds = round2(first * entry * 2 * 100);
  return { steps, canTrim: true, costCoveredAfterStep1: step1Proceeds >= totalCost, totalCost, step1Proceeds };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Server-side gate. Returns a reason to block, or null if the 0DTE rules
// allow this entry. `authorizedZeroDteToday` counts sessions already
// authorized today whose expiration was today.
export function zeroDteBlockReason(opts: {
  expiration: string | null | undefined;
  authorizedZeroDteToday: number;
  now?: Date;
}): string | null {
  const now = opts.now ?? new Date();
  if (!isZeroDte(opts.expiration, etDate(now))) return null;
  const min = etMinutes(now);
  if (min >= ZERO_DTE_ENTRY_CUTOFF_MIN) {
    return `0DTE entry cutoff: no new same-day options at or after ${formatEtMinutes(ZERO_DTE_ENTRY_CUTOFF_MIN)} ET. Theta and gamma are at their most violent in the last hour.`;
  }
  if (opts.authorizedZeroDteToday >= ZERO_DTE_DAILY_MAX) {
    return `0DTE limit: ${opts.authorizedZeroDteToday} same-day trades already taken today (max ${ZERO_DTE_DAILY_MAX}).`;
  }
  return null;
}
