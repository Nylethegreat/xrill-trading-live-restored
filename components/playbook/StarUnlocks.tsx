"use client";

import { useState } from "react";
import { playBoop } from "@/lib/sounds";

// Real balance-gated star unlocks -- thresholds Nyle asked for directly
// ($100k, $250k, $1M), independent of the $250-$5,000 Double-Up Ladder
// (lib/data/milestones.ts) and the 12-stage Compound Scaling Roadmap on
// this same page. Locked/unlocked is computed from the real account
// balance passed in, never faked.
interface StarTier {
  threshold: number;
  label: string;
  blurb: string;
}

export const STAR_TIERS: StarTier[] = [
  { threshold: 100_000, label: "Purple Star", blurb: "Six-figure account." },
  { threshold: 250_000, label: "Rainbow Star", blurb: "Quarter-million milestone." },
  { threshold: 1_000_000, label: "Prismatic Star", blurb: "Seven figures. The one everyone's chasing." },
];

type StarKind = "purple" | "rainbow" | "prismatic";
export const starKind = (i: number): StarKind => (i === 0 ? "purple" : i === 1 ? "rainbow" : "prismatic");

export function StarIcon({ tier, unlocked, size = 44, idSuffix = "" }: { tier: StarKind; unlocked: boolean; size?: number; idSuffix?: string }) {
  const gradientId = `star-grad-${tier}${idSuffix}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={unlocked ? "motion-safe:animate-star-spin" : ""}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {tier === "purple" && (
            <>
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#e9d5ff" />
            </>
          )}
          {tier === "rainbow" && (
            <>
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="25%" stopColor="#facc15" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="75%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#c026d3" />
            </>
          )}
          {tier === "prismatic" && (
            <>
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#93c5fd" />
            </>
          )}
        </linearGradient>
      </defs>
      <path
        d="M12 1.5 L14.7 8.8 L22.5 9.3 L16.3 14.1 L18.4 21.8 L12 17.4 L5.6 21.8 L7.7 14.1 L1.5 9.3 L9.3 8.8 Z"
        fill={`url(#${gradientId})`}
        stroke={unlocked ? "#fff" : "#8a8a95"}
        strokeWidth="0.6"
        opacity={unlocked ? 1 : 0.35}
      />
      <ellipse cx="9.5" cy="12" rx="1" ry="1.6" fill="#111" opacity={unlocked ? 1 : 0.5} />
      <ellipse cx="14.5" cy="12" rx="1" ry="1.6" fill="#111" opacity={unlocked ? 1 : 0.5} />
    </svg>
  );
}

// One clickable star: plays the boop (a pop if unlocked, a thud if not)
// and replays a squash-and-pop animation by remounting on a counter key.
export function BoopStar({ index, balance, size = 44, idSuffix = "" }: { index: number; balance: number; size?: number; idSuffix?: string }) {
  const tier = STAR_TIERS[index];
  const unlocked = balance >= tier.threshold;
  const [boops, setBoops] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        playBoop(unlocked);
        setBoops((n) => n + 1);
      }}
      title={unlocked ? `${tier.label} — unlocked` : `${tier.label} — unlocks at $${tier.threshold.toLocaleString()}`}
      aria-label={`${tier.label}${unlocked ? " (unlocked)" : " (locked)"}`}
      className={`rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${unlocked ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : ""}`}
    >
      <span key={boops} className={`block ${boops > 0 ? "motion-safe:animate-star-boop" : ""}`}>
        <StarIcon tier={starKind(index)} unlocked={unlocked} size={size} idSuffix={idSuffix} />
      </span>
    </button>
  );
}

// Compact row of the three stars for the dashboard account card.
export function StarRow({ balance }: { balance: number }) {
  const count = STAR_TIERS.filter((t) => balance >= t.threshold).length;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] uppercase tracking-wide text-white/40">
        Stars <span className="font-mono text-yellow-300/80">{count}/3</span>
      </span>
      <div className="flex items-center gap-2">
        {STAR_TIERS.map((t, i) => (
          <BoopStar key={t.threshold} index={i} balance={balance} size={28} idSuffix="-mini" />
        ))}
      </div>
    </div>
  );
}

export default function StarUnlocks({ balance }: { balance: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {STAR_TIERS.map((tier, i) => {
        const unlocked = balance >= tier.threshold;
        return (
          <div
            key={tier.threshold}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center ${
              unlocked ? "border-white/20 bg-white/5" : "border-white/10 bg-black/20"
            }`}
          >
            <BoopStar index={i} balance={balance} />
            <p className={`text-sm font-semibold ${unlocked ? "text-white" : "text-white/40"}`}>{tier.label}</p>
            <p className="text-[11px] text-white/40">{tier.blurb}</p>
            <p className={`text-[10px] font-mono ${unlocked ? "text-accent" : "text-white/30"}`}>
              {unlocked ? "UNLOCKED · tap me" : `Unlocks at $${tier.threshold.toLocaleString()}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
