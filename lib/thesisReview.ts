// Thesis Review for XRILL Intelligence: what your own notes say about
// your trading once the results are in. Links conviction going in, how
// you felt coming out, whether the thesis played out, and why you
// actually exited. Pure function over the journal rows; no new queries.

import type { SessionOutcomeRow } from "@/lib/analytics";
import { EXIT_REASONS, type ExitReason } from "@/lib/thesis";

export interface Bucket {
  label: string;
  trades: number;
  wins: number;
  winRate: number | null;
  net: number;
}

export interface ThesisReview {
  closed: number;
  withThesis: number;
  withConfidence: number;
  avgConfidenceShift: number | null; // after - before, where both rated
  thesisPlayedOutRate: number | null; // of trades with a thesis result
  confidence: Bucket[]; // by confidence before entry
  exits: (Bucket & { key: ExitReason })[];
  strategies: (Bucket & { avgSetupScore: number | null })[];
  emotionalExits: number;
  emotionalExitsThesisIntact: number; // got out on nerves while the thesis was still working
  insights: string[];
}

const MIN_FOR_INSIGHT = 3;

function bucket(label: string, rows: SessionOutcomeRow[]): Bucket {
  const wins = rows.filter((r) => (r.profit_loss ?? 0) > 0).length;
  return {
    label,
    trades: rows.length,
    wins,
    winRate: rows.length ? (wins / rows.length) * 100 : null,
    net: Math.round(rows.reduce((s, r) => s + Number(r.profit_loss ?? 0), 0) * 100) / 100,
  };
}

export function buildThesisReview(rows: SessionOutcomeRow[]): ThesisReview | null {
  const closed = rows.filter((r) => r.profit_loss !== null && r.profit_loss !== undefined);
  if (closed.length === 0) return null;

  const withThesis = closed.filter((r) => r.thesis || r.invalidation).length;
  const rated = closed.filter((r) => r.confidence_pre !== null);

  const both = closed.filter((r) => r.confidence_pre !== null && r.confidence_post !== null);
  const avgConfidenceShift = both.length
    ? Math.round((both.reduce((s, r) => s + (r.confidence_post! - r.confidence_pre!), 0) / both.length) * 10) / 10
    : null;

  const judged = closed.filter((r) => r.thesis_result);
  const thesisPlayedOutRate = judged.length
    ? (judged.filter((r) => r.thesis_result === "played_out").length / judged.length) * 100
    : null;

  const confidence = [
    bucket("Low (1–4)", rated.filter((r) => r.confidence_pre! <= 4)),
    bucket("Medium (5–7)", rated.filter((r) => r.confidence_pre! >= 5 && r.confidence_pre! <= 7)),
    bucket("High (8–10)", rated.filter((r) => r.confidence_pre! >= 8)),
  ];

  const exits = EXIT_REASONS.map((e) => ({ key: e.key, ...bucket(e.label, closed.filter((r) => r.exit_reason === e.key)) })).filter(
    (b) => b.trades > 0
  );

  const byStrategy = new Map<string, SessionOutcomeRow[]>();
  for (const r of closed) {
    if (!r.setup_type) continue;
    byStrategy.set(r.setup_type, [...(byStrategy.get(r.setup_type) ?? []), r]);
  }
  const strategies = [...byStrategy.entries()]
    .map(([name, rs]) => {
      const scored = rs.filter((r) => r.setup_score !== null);
      return {
        ...bucket(name, rs),
        avgSetupScore: scored.length ? Math.round((scored.reduce((s, r) => s + r.setup_score!, 0) / scored.length) * 10) / 10 : null,
      };
    })
    .sort((a, b) => b.trades - a.trades);

  const emotional = closed.filter((r) => r.exit_reason === "emotional");
  const emotionalExitsThesisIntact = emotional.filter((r) => r.thesis_result === "played_out" || r.thesis_result === "partial").length;

  const insights: string[] = [];
  if (emotional.length > 0) {
    insights.push(
      emotionalExitsThesisIntact > 0
        ? `${emotional.length} exit${emotional.length === 1 ? "" : "s"} on nerves, and on ${emotionalExitsThesisIntact} of them your thesis was still working. Next time, check your wrong-if before you hit sell.`
        : `${emotional.length} exit${emotional.length === 1 ? "" : "s"} on nerves so far. Logging them is how this number goes down.`
    );
  }
  const [low, , high] = confidence;
  if (high.trades >= MIN_FOR_INSIGHT && low.trades >= MIN_FOR_INSIGHT && high.winRate !== null && low.winRate !== null) {
    const diff = high.winRate - low.winRate;
    insights.push(
      Math.abs(diff) < 10
        ? "Your high-confidence and low-confidence trades win about as often. Your gut isn't adding much edge yet, so lean on the score."
        : diff > 0
          ? `Your high-confidence trades win ${Math.round(diff)} points more often than your low-confidence ones. Your read is worth listening to.`
          : `Your low-confidence trades are actually winning more than your high-confidence ones. Overconfidence might be costing you.`
    );
  }
  if (avgConfidenceShift !== null && both.length >= MIN_FOR_INSIGHT && avgConfidenceShift <= -2) {
    insights.push(
      `On average you come out ${Math.abs(avgConfidenceShift)} points less sure than you went in. If that drop happens mid-trade, it's usually the moment you're tempted to bail early.`
    );
  }
  const best = strategies.filter((s) => s.trades >= MIN_FOR_INSIGHT && s.winRate !== null).sort((a, b) => b.winRate! - a.winRate!);
  if (best.length >= 2) {
    insights.push(
      `Best strategy so far: ${best[0].label} (${Math.round(best[0].winRate!)}% wins over ${best[0].trades}). Weakest: ${best[best.length - 1].label} (${Math.round(best[best.length - 1].winRate!)}%).`
    );
  }
  if (withThesis < closed.length && closed.length >= MIN_FOR_INSIGHT) {
    insights.push(
      `${closed.length - withThesis} of your ${closed.length} closed trades have no thesis written. The more you fill in, the sharper this review gets.`
    );
  }

  return {
    closed: closed.length,
    withThesis,
    withConfidence: rated.length,
    avgConfidenceShift,
    thesisPlayedOutRate,
    confidence,
    exits,
    strategies,
    emotionalExits: emotional.length,
    emotionalExitsThesisIntact,
    insights,
  };
}
