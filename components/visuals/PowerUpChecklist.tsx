"use client";

import { useEffect, useState } from "react";

// A red-glow "buff bar" for the physical/mental basics that actually move
// trading performance — water, food, breath, sunlight, grounding, a real
// human conversation, a few minutes with a pet. Nothing here is tracked in
// the database; it's a same-day nudge, so state lives in localStorage keyed
// to today's date and quietly resets every morning. If localStorage isn't
// available (SSR, privacy mode) it just falls back to an in-memory toggle
// for the session — never throws, never blocks render.

type PowerUp = { key: string; icon: string; label: string; note: string };

const POWER_UPS: PowerUp[] = [
  { key: "water", icon: "💧", label: "Water", note: "Dehydration alone measurably slows reaction time and judgment." },
  { key: "protein", icon: "🥩", label: "Protein / Real Food", note: "Trading hungry is trading on adrenaline, not a plan." },
  { key: "breath", icon: "🌬️", label: "Deep Breaths", note: "60 seconds of slow breathing resets an activated nervous system." },
  { key: "sunlight", icon: "☀️", label: "Sunlight", note: "Even 10 minutes outside recalibrates your circadian / mood baseline." },
  { key: "grounding", icon: "🌍", label: "Grounding", note: "Feet on the floor, phone down, one full minute of just noticing the room." },
  { key: "social", icon: "🗣️", label: "Social Check-In", note: "A real conversation — not a DM — before you sit down to trade." },
  { key: "dog", icon: "🐕", label: "Dog / Pet Time", note: "A few minutes with an animal drops cortisol faster than almost anything else." },
];

function todayKey() {
  const d = new Date();
  return `xrill-powerups-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function PowerUpChecklist() {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [storageKey, setStorageKey] = useState<string | null>(null);

  useEffect(() => {
    const key = todayKey();
    setStorageKey(key);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setActive(JSON.parse(raw));
    } catch {
      // localStorage unavailable -- fall back to in-memory state only.
    }
  }, []);

  function toggle(key: string) {
    setActive((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // best-effort only
        }
      }
      return next;
    });
  }

  const activeCount = POWER_UPS.filter((p) => active[p.key]).length;

  return (
    <div className="relative overflow-hidden rounded border border-loss/30 bg-gradient-to-br from-loss/10 via-surface to-surface p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-loss/20 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-loss">
          🔴 Power-Up Protocol
        </h2>
        <span className="font-mono text-xs text-white/50">{activeCount}/{POWER_UPS.length}</span>
      </div>
      <p className="relative mt-1 text-xs text-white/40">
        The basics that actually move your trading, before any chart does. Resets every day.
      </p>

      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-loss transition-all duration-500"
          style={{ width: `${(activeCount / POWER_UPS.length) * 100}%`, boxShadow: activeCount > 0 ? "0 0 10px 1px rgba(239,68,68,0.6)" : undefined }}
        />
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {POWER_UPS.map((p) => {
          const isActive = !!active[p.key];
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => toggle(p.key)}
              title={p.note}
              className={`flex flex-col items-center gap-1 rounded border p-2.5 text-center text-[11px] font-medium transition-all ${
                isActive
                  ? "border-loss bg-loss/15 text-white shadow-[0_0_14px_-2px_rgba(239,68,68,0.65)]"
                  : "border-white/10 text-white/50 hover:border-loss/40 hover:text-white/80"
              }`}
            >
              <span className={`text-lg ${isActive ? "" : "grayscale opacity-60"}`}>{p.icon}</span>
              {p.label}
            </button>
          );
        })}
      </div>

      {activeCount === POWER_UPS.length && (
        <p className="relative mt-3 text-center text-[11px] font-bold uppercase tracking-wide text-loss">
          ⚡ Fully Charged — you're set up to trade from a good state, not a reactive one.
        </p>
      )}
    </div>
  );
}
