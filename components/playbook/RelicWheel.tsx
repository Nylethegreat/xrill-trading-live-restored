"use client";

import { useState } from "react";
import RelicIcon from "@/components/visuals/RelicIcon";
import { RELICS } from "@/lib/data/relics";

// Spinning relic wheel for the top of the Relic Codex. The ring orbits
// slowly (pauses on hover); each relic counter-rotates so it stays upright.
// Unlocked relics glow in their color, locked ones are silhouettes. A
// progress arc fills the rim as stages clear. Tap a relic to read it in
// the hub. Motion classes live in app/globals.css (.xr-relic-*).
export default function RelicWheel({ balance }: { balance: number }) {
  const unlockedCount = RELICS.filter((r) => balance >= r.unlockAt).length;
  const next = RELICS.find((r) => balance < r.unlockAt) ?? null;
  const [picked, setPicked] = useState<string | null>(null);
  const sel = RELICS.find((r) => r.id === picked) ?? null;
  const n = RELICS.length;

  // Progress arc on a 200x200 rim, radius 92.
  const circ = 2 * Math.PI * 92;
  const progress = unlockedCount / n;

  return (
    <div className="xr-relic-wheel relative mx-auto mt-6 aspect-square w-full max-w-[420px] select-none">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="relic-hub" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#3a2a08" />
            <stop offset="100%" stopColor="#0b0b10" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="98" fill="#0b0b10" opacity="0.6" />
        <g className="xr-relic-orbit" style={{ transformOrigin: "100px 100px" }}>
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const long = i % 5 === 0;
            return (
              <line
                key={i}
                x1={100 + Math.cos(a) * (long ? 84 : 87)}
                y1={100 + Math.sin(a) * (long ? 84 : 87)}
                x2={100 + Math.cos(a) * 90}
                y2={100 + Math.sin(a) * 90}
                stroke="#fbbf24"
                strokeOpacity={long ? 0.5 : 0.2}
                strokeWidth={long ? 0.8 : 0.5}
              />
            );
          })}
        </g>
        <circle cx="100" cy="100" r="92" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="3" />
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${circ * progress} ${circ}`}
          transform="rotate(-90 100 100)"
          style={{ filter: "drop-shadow(0 0 4px #fbbf24)" }}
        />
        <circle cx="100" cy="100" r="44" fill="url(#relic-hub)" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="1" />
      </svg>

      <div className="xr-relic-orbit absolute inset-0">
        {RELICS.map((r, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const on = balance >= r.unlockAt;
          const isPicked = picked === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setPicked(isPicked ? null : r.id)}
              aria-label={`${r.name}${on ? " (unlocked)" : " (locked)"}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/60"
              style={{ left: `${50 + Math.cos(a) * 34}%`, top: `${50 + Math.sin(a) * 34}%` }}
            >
              <span className="xr-relic-upright block">
              <span
                className={`flex items-center justify-center rounded-full border p-1.5 transition-transform ${
                  isPicked ? "scale-125" : "hover:scale-110"
                }`}
                style={{
                  borderColor: on ? `${r.color}aa` : "rgba(255,255,255,0.12)",
                  background: on ? `${r.color}22` : "rgba(0,0,0,0.5)",
                  boxShadow: on ? `0 0 14px ${r.color}66` : undefined,
                }}
              >
                <RelicIcon id={r.id} unlocked={on} size={40} glow={on ? r.color : undefined} />
              </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 flex w-[40%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
        {sel ? (
          <>
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/45">Stage {sel.stage}</p>
            <p className="mt-0.5 text-[13px] font-bold leading-tight" style={{ color: sel.color }}>
              {sel.name}
            </p>
            <p className="mt-1 font-mono text-[10px] text-white/55">
              {balance >= sel.unlockAt ? "UNLOCKED" : `$${sel.unlockAt.toLocaleString()}`}
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-2xl font-bold text-yellow-300 [text-shadow:0_0_10px_rgba(250,204,21,0.6)]">
              {unlockedCount}/{n}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/45">relics</p>
            {next && (
              <p className="mt-1 text-[10px] leading-tight text-white/55">
                Next: {next.name}
                <br />
                <span className="font-mono text-white/40">${(next.unlockAt - balance).toLocaleString()} to go</span>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
