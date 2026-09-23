"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "xrill-bouncing-stars";

// A handful of small translucent stars drifting around in fixed
// positions across the viewport, each with its own size/delay/duration
// so they don't move in unison. Purely decorative (aria-hidden,
// pointer-events-none except the toggle button itself). Off by default;
// persisted per-visitor in localStorage, same pattern as SoundToggle.
const STARS = [
  { top: "12%", left: "8%", size: 22, delay: "0s", duration: "16s" },
  { top: "68%", left: "18%", size: 16, delay: "2s", duration: "13s" },
  { top: "30%", left: "82%", size: 26, delay: "1s", duration: "19s" },
  { top: "80%", left: "70%", size: 18, delay: "3.5s", duration: "15s" },
  { top: "50%", left: "45%", size: 14, delay: "0.5s", duration: "17s" },
  { top: "20%", left: "55%", size: 20, delay: "4s", duration: "14s" },
];

function StarField() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {STARS.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={s.size}
          height={s.size}
          className="absolute opacity-40 motion-safe:animate-star-drift"
          style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.duration }}
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
  const [enabled, setEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setEnabled(window.localStorage.getItem(STORAGE_KEY) === "on");
    } catch {
      // ignore — defaults to off
    }
    setHydrated(true);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // best-effort; a private-browsing quota error here shouldn't break the toggle
    }
  }

  return (
    <>
      {hydrated && enabled && <StarField />}
      <button
        type="button"
        onClick={toggle}
        className={`relative z-10 mt-4 rounded border px-3 py-1.5 text-xs font-medium ${
          enabled ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-300" : "border-white/15 text-white/50 hover:bg-white/5"
        }`}
      >
        {enabled ? "✨ Background stars: ON" : "Background stars: OFF"}
      </button>
    </>
  );
}
