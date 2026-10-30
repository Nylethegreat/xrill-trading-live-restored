import { createClient } from "@/lib/supabase/server";
import type { SessionOutcomeRow } from "@/lib/analytics";
import { getSessionOutcomeRows } from "@/lib/data/xrill-analytics-data";
import { journalStreak, planAdherence, tierFor } from "@/lib/disciplineStreaks";

// Discord shout-outs when a member's streak crosses into a new tier
// (Warming Up, Locked In, Machine, Unshakeable, Legend). Only for members
// who joined the Discipline Board, only habits (never P&L), and always
// best-effort: a Discord hiccup never fails a journal save.
//
// Posts to DISCORD_COMMUNITY_WEBHOOK_URL -- a separate channel from the
// trade-alert webhook. Unset = no shout-outs.

const STREAKS = [
  { key: "plan", label: "Plan Adherence", unit: "rule exits in a row", emoji: "🎯", color: 0x22c55e, count: (r: SessionOutcomeRow[]) => planAdherence(r).current },
  { key: "journal", label: "Journal Streak", unit: "fully reviewed trades in a row", emoji: "📓", color: 0x3b82f6, count: (r: SessionOutcomeRow[]) => journalStreak(r).current },
] as const;

export async function announceStreakTiers(userId: string, before: SessionOutcomeRow[]) {
  const webhook = process.env.DISCORD_COMMUNITY_WEBHOOK_URL;
  if (!webhook) return;

  try {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, show_on_leaderboard")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile?.show_on_leaderboard) return;

    const after = await getSessionOutcomeRows(userId);
    const name = profile.display_name?.trim() || "A trader";

    for (const s of STREAKS) {
      const was = tierFor(s.count(before)).current;
      const nowCount = s.count(after);
      const now = tierFor(nowCount).current;
      if (!now || (was && was.at >= now.at)) continue;

      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `${s.emoji} ${name} hit ${now.name.toUpperCase()}`,
              description: `${s.label}: **${nowCount}** ${s.unit}. Discipline, not P&L.`,
              color: s.color,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    }
  } catch (err) {
    console.error("Streak shout-out failed:", err);
  }
}
