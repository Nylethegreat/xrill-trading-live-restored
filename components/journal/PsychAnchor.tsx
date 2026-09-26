"use client";

import { useState } from "react";

// Five questions research keeps finding underneath daily emotional
// stability -- safety, belonging, competence, autonomy, meaning (rooted in
// Self-Determination Theory and Baumeister & Leary's belongingness work,
// same lineage as the dashboard's Red Day card). The tie-in to XRILL
// itself: a structured, rules-based system is mostly an answer to
// questions 3 and 4 ("Am I capable? Am I in control?") -- but that only
// works once question 1 (safety) is actually settled, which is the whole
// case for hard stops and a real risk ceiling instead of "just trade
// smarter." Collapsed by default so it doesn't compete with the Codex.
const QUESTIONS = [
  {
    icon: "🛡️",
    title: "Am I safe and secure?",
    body: "The baseline the nervous system checks first. Until this reads 'yes, I'm okay right now,' deep focus and real satisfaction stay out of reach -- which is exactly why a hard stop and a real risk ceiling matter more than any entry signal.",
  },
  {
    icon: "🤝",
    title: "Do I matter, and am I accepted?",
    body: "The need to feel connected -- to a person, a group, a tribe. Chronic isolation registers in the brain like physical pain. Worth noticing how much weight a text reply or a DM carries some days.",
  },
  {
    icon: "🎯",
    title: "Am I capable of handling today?",
    body: "Mastery and progress -- proof you're still effective, not stuck. This is the engine behind both daily pride and daily self-doubt.",
  },
  {
    icon: "🧭",
    title: "Am I in control of my own life?",
    body: "Autonomy -- choosing your direction versus reacting to whatever's on fire. Feeling like a passenger in your own life is one of the fastest routes to burnout.",
  },
  {
    icon: "🌅",
    title: "What is the point of all this?",
    body: "Meaning and direction. Past today's task list: does the effort add up to something, and does tomorrow matter more than today?",
  },
];

export default function PsychAnchor() {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded border border-primary/25 bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          🧭 The 5 Questions Underneath a Bad Day
        </span>
        <span className="text-xs text-white/40">{open ? "Hide" : "Why some days feel heavier →"}</span>
      </button>

      {open && (
        <div className="border-t border-primary/20 p-4 pt-3">
          <p className="text-xs text-white/50">
            Most days aren't really about the market. They're one of these five questions asking to be answered.
          </p>

          <div className="mt-3 space-y-2">
            {QUESTIONS.map((q) => (
              <div key={q.title} className="rounded border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <span>{q.icon}</span>
                  {q.title}
                </div>
                <p className="mt-1 text-xs text-white/60">{q.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-white/40">
            People come to trading (or fitness, or any hard skill) chasing questions 3 and 4 -- "am I capable, am I
            in control" -- but usually get stuck on question 1 first. A rules-based system like XRILL's gate
            pipeline mostly works because it takes the guesswork out of that first question, not because it's a
            magic edge.
          </p>
        </div>
      )}
    </div>
  );
}
