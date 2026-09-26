"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "xrill-bouncing-stars";

type Speed = "off" | "chill" | "medium" | "fast";

const SPEEDS: { key: Speed; label: string }[] = [
  { key: "off", label: "Off" },
  { key: "chill", label: "Chill" },
  { key: "medium", label: "Medium" },
  { key: "fast", label: "Fast" },
];

// Duration multiplier per speed -- applied to each star's base duration.
// Lower multiplier = faster drift. "Fast" also gets a fuller field (extra
// stars mixed in below) since more stars + quicker motion reads as "a lot
// more going on" the way the user asked for, not just a faster loop.
const SPEED_MULTIPLIER: Record<Exclude<Speed, "off">, number> = {
  chill: 1.6,
  medium: 1,
  fast: 0.45,
};

// A handful of small translucent stars drifting around in fixed
// positions across the viewport, each with its own size/delay/base
// duration so they don't move in unison. Off by default; persisted
// per-visitor in localStorage, same pattern as SoundToggle.
const BASE_STARS = [
  { top: "12%", left: "8%", size: 22, delay: "0s", duration: 16 },
  { top: "68%", left: "18%", size: 16, delay: "2s", duration: 13 },
  { top: "30%", left: "82%", size: 26, delay: "1s", duration: 19 },
  { top: "80%", left: "70%", size: 18, delay: "3.5s", duration: 15 },
  { top: "50%", left: "45%", size: 14, delay: "0.5s", duration: 17 },
  { top: "20%", left: "55%", size: 20, delay: "4s", duration: 14 },
];

// Extra stars mixed in only on "fast" so the field feels noticeably
// busier, not just quicker.
const FAST_EXTRA_STARS = [
  { top: "40%", left: "10%", size: 12, delay: "1.2s", duration: 12 },
  { top: "6%", left: "40%", size: 15, delay: "2.8s", duration: 15 },
  { top: "88%", left: "35%", size: 13, delay: "0.8s", duration: 13 },
  { top: "58%", left: "90%", size: 17, delay: "3.1s", duration: 16 },
];

function StarField({ speed }: { speed: Exclude<Speed, "off"> }) {
  const multiplier = SPEED_MULTIPLIER[speed];
  const stars = speed === "fast" ? [...BASE_STARS, ...FAST_EXTRA_STARS] : BASE_STARS;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={s.size}
          height={s.size}
          className="absolute opacity-40 motion-safe:animate-star-drift"
          style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: `${s.duration * multiplier}s` }}
        >
          <path
            d="M12 1.5 L14.7 8.8 L22.5 9.3 L16.3 14.1 L18.4 21.8 L12 17.4 L5.6 21.8 L7.7 14.1 L1.5 9.3 L9.3 8.8 Z"
            fill="#fde047"
            opacity="0.5"
          />
        </svg>
      ))}
    </div>
  );
}

export default function BouncingStarsToggle() {
  const [speed, setSpeed] = useState<Speed>("off");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "on") {
        // migrate the old boolean on/off value to the new "medium" speed
        setSpeed("medium");
      } else if (stored === "chill" || stored === "medium" || stored === "fast" || stored === "off") {
        setSpeed(stored);
      }
    } catch {
      // ignore -- defaults to off
    }
    setHydrated(true);
  }, []);

  function pick(next: Speed) {
    setSpeed(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // best-effort; a private-browsing quota error here shouldn't break the toggle
    }
  }

  return (
    <>
      {hydrated && speed !== "off" && <StarField speed={speed} />}
      <div className="relative z-10 mt-4 inline-flex gap-1 rounded border border-white/10 p-1">
        {SPEEDS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => pick(s.key)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              speed === s.key
                ? "bg-yellow-400/15 text-yellow-300"
                : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            {s.key === "off" ? "✨ Stars: Off" : s.label}
          </button>
        ))}
      </div>
    </>
  );
}
