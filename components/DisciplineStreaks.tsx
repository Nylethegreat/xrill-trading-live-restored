import Link from "next/link";
import type { SessionOutcomeRow } from "@/lib/analytics";
import {
  MIN_FOR_COMPARISON,
  journalStreak,
  planAdherence,
  tierFor,
} from "@/lib/disciplineStreaks";

// Two progress meters on XRILL Status that reward habits, not P&L:
// reviewing every closed trade, and exiting on a rule instead of nerves.
// Server-safe (no hooks); math lives in lib/disciplineStreaks.ts.
export default function DisciplineStreaks({ rows }: { rows: SessionOutcomeRow[] }) {
  const journal = journalStreak(rows);
  const plan = planAdherence(rows);

  if (journal.closed === 0 && plan.ruleExits + plan.emotionalExits === 0) {
    return (
      <p className="rounded border border-white/10 bg-white/5 p-3 text-sm text-white/50">
        These start counting once you close your first trade in the Journal. Review it fully and exit on a rule, and both
        meters move.
      </p>
    );
  }

  const showComparison = plan.rule.trades >= MIN_FOR_COMPARISON && plan.emotional.trades >= MIN_FOR_COMPARISON;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Meter
        icon="📓"
        title="Journal Streak"
        hint="Closed trades in a row with a full review: why you exited, did the thesis play out, confidence after."
        count={journal.current}
        best={journal.best}
        unit="reviewed"
        tone="primary"
      >
        {journal.pendingReview > 0 ? (
          <Link href="/journal" className="text-caution underline">
            {journal.pendingReview} closed trade{journal.pendingReview === 1 ? "" : "s"} waiting for review →
          </Link>
        ) : (
          <span className="text-white/45">Every closed trade is reviewed.</span>
        )}
      </Meter>

      <Meter
        icon="🎯"
        title="Plan Adherence"
        hint="Exits in a row on a rule (target, stop, or your wrong-if). An emotional exit resets it. A planned stop-out still counts."
        count={plan.current}
        best={plan.best}
        unit="rule exits"
        tone="accent"
      >
        {plan.rate === null ? (
          <span className="text-white/45">Pick an exit reason when you close a trade to start this one.</span>
        ) : (
          <span className="text-white/60">
            {plan.rate}% of exits on a rule ({plan.ruleExits} rule · {plan.emotionalExits} emotional)
          </span>
        )}
        {showComparison && (
          <span className="mt-1 block text-white/60">
            Rule exits avg <R value={plan.rule.avgR} /> vs emotional exits avg <R value={plan.emotional.avgR} />
          </span>
        )}
      </Meter>
    </div>
  );
}

const TONE = {
  primary: { text: "text-primary", bar: "bg-primary", glow: "shadow-[0_0_10px_rgba(59,130,246,0.6)]" },
  accent: { text: "text-accent", bar: "bg-accent", glow: "shadow-[0_0_10px_currentColor]" },
} as const;

function Meter({
  icon,
  title,
  hint,
  count,
  best,
  unit,
  tone,
  children,
}: {
  icon: string;
  title: string;
  hint: string;
  count: number;
  best: number;
  unit: string;
  tone: keyof typeof TONE;
  children: React.ReactNode;
}) {
  const t = TONE[tone];
  const { current, next, progress } = tierFor(count);

  return (
    <div className="rounded border border-white/10 bg-surface p-3" title={hint}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
            {icon} {title}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">
            <span className={count > 0 ? t.text : "text-white/40"}>{count}</span>{" "}
            <span className="text-xs font-normal text-white/40">{unit}</span>
          </p>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-wide">
          <p className={current ? t.text : "text-white/30"}>{current ? current.name : "Unranked"}</p>
          <p className="text-white/35">Best {best}</p>
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/50">
        <div className={`h-full rounded-full ${t.bar} ${count > 0 ? t.glow : ""}`} style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-white/40">
        {next ? `${next.at - count} more to ${next.name}` : "Top tier reached. Keep it there."}
      </p>

      <p className="mt-2 text-xs">{children}</p>
    </div>
  );
}

function R({ value }: { value: number | null }) {
  if (value === null) return <span>—</span>;
  return (
    <span className={value >= 0 ? "text-accent" : "text-loss"}>
      {value > 0 ? "+" : ""}
      {value.toFixed(2)}R
    </span>
  );
}
