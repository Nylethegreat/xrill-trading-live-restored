"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// One honest question at the top of Analytics: "Are you happy with this?"
// Five glowing answers, each with a short, specific response and a next
// step. Remembered for today in this browser only.

type Mood = "thrilled" | "happy" | "neutral" | "not_yet" | "frustrated";

const ANSWERS: { id: Mood; emoji: string; label: string; color: string; reply: string; link?: { href: string; label: string } }[] = [
  {
    id: "thrilled",
    emoji: "🚀",
    label: "Thrilled",
    color: "#22c55e",
    reply: "Lock in what's working before it feels normal. Write the one rule that got you here into your codex — euphoria is when size creeps up.",
    link: { href: "/journal", label: "Write it in the codex" },
  },
  {
    id: "happy",
    emoji: "😊",
    label: "Happy",
    color: "#38bdf8",
    reply: "Good. Same size, same rules, same gates. Boring consistency is the whole edge.",
    link: { href: "/playbook", label: "Check your stage on the roadmap" },
  },
  {
    id: "neutral",
    emoji: "😐",
    label: "It's fine",
    color: "#facc15",
    reply: "Find the one number below you'd most like to move — win rate, average score, or authorization rate — and pick a single habit for that this week.",
  },
  {
    id: "not_yet",
    emoji: "🌱",
    label: "Not yet",
    color: "#f97316",
    reply: "Not yet is a stage, not a verdict. Look at your weakest setup type below and trade it less — cutting the worst bucket often beats finding a better one.",
    link: { href: "/intelligence", label: "Take a Mindset Check" },
  },
  {
    id: "frustrated",
    emoji: "😤",
    label: "Frustrated",
    color: "#f43f5e",
    reply: "Step away from the numbers for a minute. You are not your P&L. Open the Red Day card, then come back with fresh eyes — the data will still be here.",
    link: { href: "/dashboard", label: "Open the Red Day card" },
  },
];

function todayKey() {
  const d = new Date();
  return `xrill-happy-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function HappyCheck() {
  const [mood, setMood] = useState<Mood | null>(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(todayKey()) as Mood | null;
      if (v && ANSWERS.some((a) => a.id === v)) setMood(v);
    } catch {}
  }, []);

  function pick(m: Mood) {
    setMood(m);
    try {
      window.localStorage.setItem(todayKey(), m);
    } catch {}
  }

  const chosen = ANSWERS.find((a) => a.id === mood);

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-rose-500/10 p-4">
      <p className="text-center text-base font-semibold text-white">Are you happy with this?</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {ANSWERS.map((a) => {
          const active = a.id === mood;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => pick(a.id)}
              className="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition"
              style={
                active
                  ? { borderColor: a.color, background: `${a.color}33`, color: "#fff", boxShadow: `0 0 14px ${a.color}88` }
                  : { borderColor: `${a.color}66`, color: a.color, background: `${a.color}10` }
              }
            >
              {a.emoji} {a.label}
            </button>
          );
        })}
      </div>
      {chosen && (
        <div className="mx-auto mt-3 max-w-xl rounded-lg border bg-black/30 p-3 text-sm text-white/85" style={{ borderColor: `${chosen.color}55` }}>
          {chosen.reply}
          {chosen.link && (
            <Link href={chosen.link.href} className="ml-1 font-semibold underline" style={{ color: chosen.color }}>
              {chosen.link.label} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
