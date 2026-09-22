"use client";

import { useEffect, useState } from "react";
import { playClickSound, SOUND_PACKS, type SoundPack } from "@/lib/sounds";

const STORAGE_KEY = "xrill-sound-prefs";

interface SoundPrefs {
  enabled: boolean;
  pack: SoundPack;
}

function loadPrefs(): SoundPrefs {
  if (typeof window === "undefined") return { enabled: false, pack: "arcade" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, pack: "arcade" };
    const parsed = JSON.parse(raw);
    return { enabled: Boolean(parsed.enabled), pack: parsed.pack ?? "arcade" };
  } catch {
    return { enabled: false, pack: "arcade" };
  }
}

// Mounted once in the root layout. Sound defaults OFF -- this only ever
// plays audio after the visitor explicitly opts in via this widget, never
// on page load.
export default function SoundToggle() {
  const [prefs, setPrefs] = useState<SoundPrefs>({ enabled: false, pack: "arcade" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // best-effort; a private-browsing quota error here shouldn't break the toggle
    }
  }, [prefs]);

  // Single document-level listener (capture phase) rather than
  // instrumenting every button/link individually -- covers the whole
  // site's clickable elements (button, a, [role=button]) automatically,
  // including ones added later.
  useEffect(() => {
    if (!prefs.enabled) return;
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement | null)?.closest("button, a, [role='button']");
      if (target) playClickSound(prefs.pack);
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [prefs.enabled, prefs.pack]);

  return (
    <div className="fixed bottom-4 left-4 z-50 font-mono text-xs">
      {open && (
        <div className="mb-2 w-44 rounded border border-white/15 bg-black/90 p-3 shadow-lg backdrop-blur">
          <label className="flex items-center justify-between gap-2 text-white/70">
            <span>Click sounds</span>
            <input
              type="checkbox"
              checked={prefs.enabled}
              onChange={(e) => setPrefs((p) => ({ ...p, enabled: e.target.checked }))}
            />
          </label>
          <div className="mt-2 space-y-1">
            {SOUND_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => {
                  setPrefs((p) => ({ ...p, pack: pack.id }));
                  playClickSound(pack.id);
                }}
                className={`block w-full rounded px-2 py-1 text-left ${
                  prefs.pack === pack.id ? "bg-accent/20 text-accent" : "text-white/50 hover:bg-white/10"
                }`}
              >
                {pack.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Sound settings"
        className={`flex h-9 w-9 items-center justify-center rounded-full border ${
          prefs.enabled ? "border-accent/50 bg-accent/15 text-accent" : "border-white/20 bg-black/70 text-white/50"
        }`}
      >
        {prefs.enabled ? "🔊" : "🔇"}
      </button>
    </div>
  );
}
