"use client";

import { useEffect, useState } from "react";
import StarField, { type StarSpeed, type StarStyle } from "@/components/visuals/StarField";

const SPEED_KEY = "xrill-bouncing-stars";
const STYLE_KEY = "xrill-star-style";

type Speed = "off" | StarSpeed;

const SPEEDS: { key: Speed; label: string }[] = [
  { key: "off", label: "✨ Stars: Off" },
  { key: "chill", label: "Chill" },
  { key: "medium", label: "Medium" },
  { key: "fast", label: "Fast 🚀" },
];

const STYLES: { key: StarStyle; label: string }[] = [
  { key: "twinkle", label: "💜 Twinkle" },
  { key: "celestial", label: "🌟 Celestial" },
];

// Star-field speed + style picker. Chill/Medium are a humble drifting
// field; Fast is full warp speed. Style swaps between the soft purple
// "Twinkle" sky and the brighter, spiky "Celestial" stars. Both settings
// are per-visitor (localStorage, same pattern as SoundToggle) and shared
// across every page that renders this component, so picking once on the
// Playbook carries over to XRILL Status and vice versa.
export default function BouncingStarsToggle({ className = "mt-4" }: { className?: string }) {
  const [speed, setSpeed] = useState<Speed>("off");
  const [starStyle, setStarStyle] = useState<StarStyle>("twinkle");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SPEED_KEY);
      if (stored === "on") {
        // migrate the old boolean on/off value to "medium"
        setSpeed("medium");
      } else if (stored === "chill" || stored === "medium" || stored === "fast" || stored === "off") {
        setSpeed(stored);
      }
      const storedStyle = window.localStorage.getItem(STYLE_KEY);
      if (storedStyle === "twinkle" || storedStyle === "celestial") setStarStyle(storedStyle);
    } catch {
      // ignore -- defaults to off / twinkle
    }
    setHydrated(true);
  }, []);

  function pickSpeed(next: Speed) {
    setSpeed(next);
    try {
      window.localStorage.setItem(SPEED_KEY, next);
    } catch {
      // best-effort
    }
  }

  function pickStyle(next: StarStyle) {
    setStarStyle(next);
    try {
      window.localStorage.setItem(STYLE_KEY, next);
    } catch {
      // best-effort
    }
  }

  return (
    <>
      {hydrated && speed !== "off" && <StarField speed={speed} starStyle={starStyle} />}
      <div className={`relative z-10 flex flex-wrap items-center gap-2 ${className}`}>
        <div className="inline-flex gap-1 rounded border border-white/10 bg-background/60 p-1">
          {SPEEDS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => pickSpeed(s.key)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                speed === s.key
                  ? s.key === "fast"
                    ? "bg-white/15 text-white [text-shadow:0_0_8px_rgba(255,255,255,0.8)]"
                    : "bg-yellow-400/15 text-yellow-300"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {speed !== "off" && (
          <div className="inline-flex gap-1 rounded border border-white/10 bg-background/60 p-1">
            {STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => pickStyle(s.key)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  starStyle === s.key
                    ? s.key === "twinkle"
                      ? "bg-blocked/20 text-purple-200"
                      : "bg-sky-300/15 text-sky-100"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
