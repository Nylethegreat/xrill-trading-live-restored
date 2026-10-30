import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/lib/data/leaderboard";
import { POINT_RULES, type BoardRow } from "@/lib/leaderboard";
import { tierFor } from "@/lib/disciplineStreaks";
import HeaderText from "@/components/HeaderText";
import OptInButton from "@/components/leaderboard/OptInButton";

export const dynamic = "force-dynamic";

function weekLabel(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default async function LeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/leaderboard");

  const { weekStart, board, viewerOptedIn, ghost } = await getLeaderboard(user.id);
  const others = board.filter((r) => !r.isViewer).length;

  // Ghost slots in at its score, so you can see whether you're beating it.
  type Line = { kind: "member"; row: BoardRow; rank: number } | { kind: "ghost" };
  const lines: Line[] = [];
  let ghostPlaced = !ghost;
  board.forEach((row, i) => {
    if (!ghostPlaced && ghost!.points > row.points) {
      lines.push({ kind: "ghost" });
      ghostPlaced = true;
    }
    lines.push({ kind: "member", row, rank: i + 1 });
  });
  if (!ghostPlaced) lines.push({ kind: "ghost" });

  const viewer = board.find((r) => r.isViewer)!;
  const beatingGhost = ghost ? viewer.points > ghost.points : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <HeaderText className="font-mono text-xl font-bold tracking-widest">DISCIPLINE BOARD</HeaderText>
          <p className="mt-1 text-sm text-white/50">
            Week of {weekLabel(weekStart)} · resets Monday. Ranked on habits, never P&amp;L.
          </p>
        </div>
        <OptInButton optedIn={viewerOptedIn} />
      </div>

      {!viewerOptedIn && (
        <p className="mt-4 rounded border border-white/10 bg-white/5 p-3 text-xs text-white/60">
          You&apos;re seeing your own row privately. Join to show up for other members (by display name, scores only, never
          your trades or P&amp;L) and get a Discord shout-out when you hit a streak tier.
        </p>
      )}

      {ghost && (
        <p className={`mt-4 text-sm ${beatingGhost ? "text-accent" : "text-white/60"}`}>
          {beatingGhost
            ? `👻 You're ahead of your best week (${ghost.points} pts). New personal record in progress.`
            : `👻 Your best week was ${ghost.points} pts (week of ${weekLabel(ghost.weekStart)}). You're ${ghost.points - viewer.points} behind it.`}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-white/5 text-left text-[11px] uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Trader</th>
              <th className="px-3 py-2 text-right">Points</th>
              <th className="px-3 py-2 text-right" title="Rule exits / emotional exits this week">Exits</th>
              <th className="px-3 py-2 text-right" title="Closed trades fully reviewed this week">Reviewed</th>
              <th className="px-3 py-2 text-right" title="Current Plan Adherence streak">🎯 Streak</th>
              <th className="px-3 py-2 text-right" title="Current Journal Streak">📓 Streak</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) =>
              line.kind === "ghost" ? (
                <tr key="ghost" className="border-t border-dashed border-white/10 text-white/35 italic">
                  <td className="px-3 py-2">👻</td>
                  <td className="px-3 py-2">Your best week ({weekLabel(ghost!.weekStart)})</td>
                  <td className="px-3 py-2 text-right font-mono">{ghost!.points}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {ghost!.ruleExits}/{ghost!.emotionalExits}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{ghost!.reviewed}</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">—</td>
                </tr>
              ) : (
                <MemberRow key={line.row.userId} row={line.row} rank={line.rank} zebra={i % 2 === 1} />
              )
            )}
          </tbody>
        </table>
      </div>

      {others === 0 && (
        <p className="mt-3 text-xs text-white/40">
          No other members on the board yet. Your ghost is your competition until they show up.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">How points work</p>
          <ul className="mt-2 space-y-1 text-sm">
            {POINT_RULES.map((r) => (
              <li key={r.label} className="flex justify-between gap-3">
                <span className="text-white/70">{r.label}</span>
                <span className={`font-mono ${r.points > 0 ? "text-accent" : "text-loss"}`}>
                  {r.points > 0 ? "+" : ""}
                  {r.points}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-white/10 bg-surface p-4 text-sm leading-relaxed text-white/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Why not P&amp;L?</p>
          <p className="mt-2">
            A P&amp;L board rewards whoever gambled hardest this week. This one rewards what actually builds a trader: exiting
            on your plan, reviewing every trade, and staying under your cap. A planned stop-out scores the same as a planned
            target.
          </p>
          <p className="mt-2">
            Your streaks live on{" "}
            <Link href="/dashboard" className="text-primary underline">
              XRILL Status
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ row, rank, zebra }: { row: BoardRow; rank: number; zebra: boolean }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank);
  const planTier = tierFor(row.planStreak).current;
  return (
    <tr
      className={`border-t border-white/10 ${row.isViewer ? "bg-accent/10" : zebra ? "bg-white/[0.02]" : ""}`}
    >
      <td className="px-3 py-2">{medal}</td>
      <td className="px-3 py-2">
        <span className={row.isViewer ? "font-semibold text-accent" : "text-white/85"}>{row.name}</span>
        {row.isViewer && !row.public && <span className="ml-2 text-[10px] text-white/40">(only you see this)</span>}
        {planTier && <span className="ml-2 text-[10px] uppercase tracking-wide text-white/40">{planTier.name}</span>}
      </td>
      <td className={`px-3 py-2 text-right font-mono font-bold ${row.points >= 0 ? "text-white" : "text-loss"}`}>{row.points}</td>
      <td className="px-3 py-2 text-right font-mono text-white/70">
        <span className="text-accent">{row.ruleExits}</span>/<span className={row.emotionalExits ? "text-loss" : ""}>{row.emotionalExits}</span>
      </td>
      <td className="px-3 py-2 text-right font-mono text-white/70">{row.reviewed}</td>
      <td className="px-3 py-2 text-right font-mono text-white/70">{row.planStreak}</td>
      <td className="px-3 py-2 text-right font-mono text-white/70">{row.journalStreak}</td>
    </tr>
  );
}
