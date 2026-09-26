"use client";

import { useState } from "react";

// A collapsed-by-default card for the days trading (or life) knocks you
// down. Not therapy, not a diagnosis, not a substitute for a real person --
// just three concrete, low-effort things to reach for, grounded in what
// psychological research (Self-Determination Theory: Deci & Ryan, plus
// Baumeister & Leary's belongingness work) consistently finds people need
// to feel steady again: a real connection, a small win, and a choice that's
// actually yours. Closes with a plain nudge toward a real person if it's
// bigger than one bad trade.

const PILLARS = [
  {
    icon: "🤝",
    title: "Connection",
    body: "Text or call one real person -- not a group chat, not IG. Just say how today actually went.",
  },
  {
    icon: "🎯",
    title: "One Small Win",
    body: "Do one thing you're good at, even tiny -- finish a chore, hit a workout, cook something. Proof you're still effective.",
  },
  {
    icon: "🧭",
    title: "Your Choice",
    body: "Pick literally anything for the next hour that's yours, not obligation -- a walk, a show, silence. No one else's agenda.",
  },
];

export default function RedDayCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded border border-loss/30 bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-loss">
          🔴 Having a Red Day?
        </span>
        <span className="text-xs text-white/40">{open ? "Hide" : "A few things that actually help →"}</span>
      </button>

      {open && (
        <div className="border-t border-loss/20 p-4 pt-3">
          <p className="text-xs text-white/50">
            A blocked trade, a bad session, a rough day in general -- whatever brought you here. These aren't about
            "fixing" anything, just steadying the ground for a minute.
          </p>

          <div className="mt-3 space-y-2">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <span>{p.icon}</span>
                  {p.title}
                </div>
                <p className="mt-1 text-xs text-white/60">{p.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-white/40">
            If this feeling is bigger than today's trade -- if it's been sitting on you for a while -- that's worth
            saying out loud to someone you trust, or a professional. Nothing here is a substitute for that.
          </p>
        </div>
      )}
    </div>
  );
}
