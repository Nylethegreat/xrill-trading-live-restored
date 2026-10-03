// Ported from the original XRILL Python coach.py (menu item "10. XRILL
// Coach" in the CLI). A quick pre-session mindset self-check — distinct
// from the Daily Check-In gate in the session wizard, which asks four
// yes/no questions. This is a 1-10 scale on four dimensions, unchanged
// from the original thresholds.

export interface CoachInput {
  confidence: number;
  discipline: number;
  emotionalControl: number;
  patience: number;
}

export type CoachStatus = "ELITE" | "READY" | "CAUTION" | "NOT READY";

export interface CoachResult {
  score: number;
  average: number;
  status: CoachStatus;
  headline: string;
  guidance: string;
}

export function scoreCoachCheckIn(input: CoachInput): CoachResult {
  const score = input.confidence + input.discipline + input.emotionalControl + input.patience;
  const average = score / 4;

  if (average >= 8.5) {
    return {
      score,
      average,
      status: "ELITE",
      headline: "You appear mentally prepared.",
      guidance: "Follow your plan and avoid unnecessary trades.",
    };
  }
  if (average >= 7) {
    return {
      score,
      average,
      status: "READY",
      headline: "Your mindset looks solid.",
      guidance: "Stay disciplined and execute your plan.",
    };
  }
  if (average >= 5) {
    return {
      score,
      average,
      status: "CAUTION",
      headline: "Your mindset may be inconsistent.",
      guidance: "Consider reducing risk and waiting for clarity.",
    };
  }
  return {
    score,
    average,
    status: "NOT READY",
    headline: "Do not force a trade.",
    guidance: "Step away and reset before participating.",
  };
}

// ---------------------------------------------------------------------------
// Position check-ins (Intelligence). The same four 1-10 dimensions, but
// tied to a specific position and taken twice: "before" (right after the
// gate clears, at entry) and "after" (once the trade is closed, or while
// you're holding it). The point is the gap between the two — how you felt
// going in vs how you feel coming out is the emotional fingerprint of the
// trade, and it's easy to rewrite the "before" in hindsight if you don't
// capture it first.
// ---------------------------------------------------------------------------

export type CheckInPhase = "before" | "after";

export const AFTER_GUIDANCE: Record<CoachStatus, { headline: string; guidance: string }> = {
  ELITE: {
    headline: "You're coming out of this trade steady.",
    guidance: "Note what kept you calm — that's the state to repeat, win or lose.",
  },
  READY: {
    headline: "You held it together.",
    guidance: "Journal the outcome while it's fresh, then decide if there's a next trade — not before.",
  },
  CAUTION: {
    headline: "This trade moved you.",
    guidance: "Shrink size or stop for the session. A rattled trader's next entry is usually a revenge entry.",
  },
  "NOT READY": {
    headline: "Done for now.",
    guidance: "Close the platform. Write down what you feel and why, then step away before the next idea looks good.",
  },
};

export const CHECKIN_DIMENSIONS = [
  { key: "confidence", label: "Confidence" },
  { key: "discipline", label: "Discipline" },
  { key: "emotionalControl", label: "Emotional control" },
  { key: "patience", label: "Patience" },
] as const;

export type CheckInDimension = (typeof CHECKIN_DIMENSIONS)[number]["key"];

export function compareCheckIns(before: CoachInput, after: CoachInput) {
  const deltas = CHECKIN_DIMENSIONS.map((d) => ({
    key: d.key,
    label: d.label,
    before: before[d.key],
    after: after[d.key],
    delta: after[d.key] - before[d.key],
  }));
  const total = deltas.reduce((s, d) => s + d.delta, 0);
  const biggestDrop = deltas.reduce((min, d) => (d.delta < min.delta ? d : min), deltas[0]);
  const biggestRise = deltas.reduce((max, d) => (d.delta > max.delta ? d : max), deltas[0]);

  let summary: string;
  if (Math.abs(total) <= 2) {
    summary = "Your state barely moved from entry to exit — that's the goal. The trade didn't run you.";
  } else if (total < 0) {
    summary = `You came out ${Math.abs(total)} points lower than you went in, mostly in ${biggestDrop.label.toLowerCase()}. Write down what in the trade caused that.`;
  } else {
    summary = `You came out ${total} points higher than you went in, mostly in ${biggestRise.label.toLowerCase()}. Good — but watch for overconfidence on the next entry.`;
  }
  return { deltas, total, summary };
}
