import Link from "next/link";
import { Grid, Stat } from "@/components/Layout";
import type { Bucket, ThesisReview } from "@/lib/thesisReview";

function money(v: number) {
  return `${v >= 0 ? "+" : "-"}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function BucketTable({ rows, extra }: { rows: (Bucket & { avgSetupScore?: number | null })[]; extra?: boolean }) {
  return (
    <div className="overflow-x-auto rounded border border-white/10">
      <table className="w-full text-left text-xs">
        <thead className="bg-white/5 text-white/50">
          <tr>
            <th className="px-3 py-2 font-medium" />
            <th className="px-3 py-2 font-medium">Trades</th>
            <th className="px-3 py-2 font-medium">Win rate</th>
            <th className="px-3 py-2 font-medium">Net P/L</th>
            {extra && <th className="px-3 py-2 font-medium">Avg setup</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.label} className="border-t border-white/10">
              <td className="px-3 py-2 text-white/80">{b.label}</td>
              <td className="px-3 py-2 font-mono text-white/70">{b.trades}</td>
              <td className="px-3 py-2 font-mono text-white/70">{b.winRate === null ? "—" : `${Math.round(b.winRate)}%`}</td>
              <td className={`px-3 py-2 font-mono ${b.net >= 0 ? "text-accent" : "text-loss"}`}>{b.trades ? money(b.net) : "—"}</td>
              {extra && (
                <td className="px-3 py-2 font-mono text-white/70">{b.avgSetupScore != null ? `${b.avgSetupScore}/25` : "—"}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// "Did I trade my thesis or my nerves?" -- built only from what you wrote
// in the engine and the journal. Empty states nudge you to fill those in
// rather than inventing anything.
export default function ThesisReviewPanel({ review }: { review: ThesisReview | null }) {
  if (!review) {
    return (
      <div className="rounded border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
        Close a trade in the{" "}
        <Link href="/journal" className="text-primary underline">
          Journal
        </Link>{" "}
        and this fills in: confidence vs results, why you exit, and which strategies actually pay you.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Grid cols={4}>
        <Stat label="Closed trades" value={String(review.closed)} />
        <Stat label="With a thesis" value={`${review.withThesis}/${review.closed}`} />
        <Stat
          label="Thesis played out"
          value={review.thesisPlayedOutRate === null ? "—" : `${Math.round(review.thesisPlayedOutRate)}%`}
        />
        <Stat
          label="Confidence in → out"
          value={review.avgConfidenceShift === null ? "—" : `${review.avgConfidenceShift > 0 ? "+" : ""}${review.avgConfidenceShift}`}
          tone={review.avgConfidenceShift !== null && review.avgConfidenceShift <= -2 ? "loss" : undefined}
        />
      </Grid>

      {review.insights.length > 0 && (
        <ul className="space-y-1.5 rounded border border-primary/30 bg-primary/10 p-3 text-sm text-white/85">
          {review.insights.map((i) => (
            <li key={i}>• {i}</li>
          ))}
        </ul>
      )}

      {review.emotionalExits > 0 && (
        <div className="rounded border border-loss/40 bg-loss/10 p-3 text-sm">
          <p className="font-medium text-loss">
            {review.emotionalExits} emotional exit{review.emotionalExits === 1 ? "" : "s"}
            {review.emotionalExitsThesisIntact > 0 && ` · ${review.emotionalExitsThesisIntact} with the thesis still working`}
          </p>
          <p className="mt-0.5 text-xs text-white/60">
            This is the number to shrink. Before selling, look at your trade&apos;s &ldquo;wrong if&rdquo;. If it hasn&apos;t
            happened, the plan says hold or follow your stop.
          </p>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
          Confidence before entry vs results{" "}
          <span className="font-normal normal-case text-white/35">({review.withConfidence} rated)</span>
        </p>
        <BucketTable rows={review.confidence} />
      </div>

      {review.exits.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Why you exited</p>
          <BucketTable rows={review.exits} />
        </div>
      )}

      {review.strategies.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">By strategy</p>
          <BucketTable rows={review.strategies} extra />
        </div>
      )}
    </div>
  );
}
