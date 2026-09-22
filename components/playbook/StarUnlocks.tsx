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

const STAR_TIERS: StarTier[] = [
  { threshold: 100_000, label: "Purple Star", blurb: "Six-figure account." },
  { threshold: 250_000, label: "Rainbow Star", blurb: "Quarter-million milestone." },
  { threshold: 1_000_000, label: "Prismatic Star", blurb: "Seven figures. The one everyone's chasing." },
];

function StarIcon({ tier, unlocked }: { tier: "purple" | "rainbow" | "prismatic"; unlocked: boolean }) {
  const gradientId = `star-grad-${tier}`;
  return (
    <svg viewBox="0 0 24 24" width={44} height={44} className={unlocked ? "motion-safe:animate-star-spin" : ""}>
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

export default function StarUnlocks({ balance }: { balance: number }) {
  const iconKind = (i: number): "purple" | "rainbow" | "prismatic" =>
    i === 0 ? "purple" : i === 1 ? "rainbow" : "prismatic";

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
            <div className={unlocked ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : ""}>
              <StarIcon tier={iconKind(i)} unlocked={unlocked} />
            </div>
            <p className={`text-sm font-semibold ${unlocked ? "text-white" : "text-white/40"}`}>{tier.label}</p>
            <p className="text-[11px] text-white/40">{tier.blurb}</p>
            <p className={`text-[10px] font-mono ${unlocked ? "text-accent" : "text-white/30"}`}>
              {unlocked ? "UNLOCKED" : `Unlocks at $${tier.threshold.toLocaleString()}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
