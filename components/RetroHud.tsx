import { levelInfo } from "@/components/MilestoneTracker";

interface HudSession {
  trade_authorized: boolean | null;
}

// Counts consecutive most-recent AUTHORIZED sessions (sessions is already
// newest-first from the dashboard's query) — a real, already-fetched
// signal, not an invented "win streak". Stops counting the moment it hits
// a blocked session, including immediately if the latest one was blocked.
function authorizedStreak(sessions: HudSession[]): number {
  let streak = 0;
  for (const s of sessions) {
    if (s.trade_authorized) streak++;
    else break;
  }
  return streak;
}

export default function RetroHud({ balance, sessions }: { balance: number; sessions: HudSession[] }) {
  const { lvl } = levelInfo(balance);
  const streak = authorizedStreak(sessions);
  const streaking = streak >= 3;

  return (
    <div className="relative z-10 flex items-center gap-2 rounded border border-white/10 bg-black/40 px-2.5 py-1.5 font-mono text-xs">
      <span className="font-bold text-yellow-300">LVL {lvl}</span>
      <span className="text-white/20">|</span>
      <span
        className={`font-bold ${
          streaking ? "text-accent motion-safe:animate-neon-flicker [text-shadow:0_0_4px_currentColor,0_0_10px_currentColor]" : "text-white/40"
        }`}
        title="Consecutive authorized sessions"
      >
        🔥 {streak} STREAK
      </span>
    </div>
  );
}
