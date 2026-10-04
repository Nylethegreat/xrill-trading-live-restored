import RelicIcon from "@/components/visuals/RelicIcon";
import { RELICS } from "@/lib/data/relics";

// The twelve stage relics as a slowly rolling strip, in stage order.
// Cleared stages glow in their realm color; locked ones are dark
// silhouettes. The list is rendered twice end-to-end so a -50% scroll
// loops seamlessly (same trick as the EKG/wins tickers); hovering pauses
// it, and with reduced motion it's just a horizontally scrollable row.
export default function RelicRoll({ balance, compact = false }: { balance: number; compact?: boolean }) {
  const unlockedCount = RELICS.filter((r) => balance >= r.unlockAt).length;
  const size = compact ? 34 : 42;

  const tiles = (dup: boolean) =>
    RELICS.map((r) => {
      const unlocked = balance >= r.unlockAt;
      return (
        <div
          key={`${r.id}${dup ? "-dup" : ""}`}
          aria-hidden={dup || undefined}
          title={unlocked ? `${r.name} — ${r.lore}` : `Stage ${r.stage} relic — unlocks at $${r.unlockAt.toLocaleString()}`}
          className={`mr-2 flex w-20 flex-none flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center ${dup ? "motion-reduce:hidden" : ""}`}
          style={
            unlocked
              ? { borderColor: `${r.color}66`, background: `${r.color}14` }
              : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.25)" }
          }
        >
          <RelicIcon id={r.id} unlocked={unlocked} size={size} glow={r.color} />
          <span className="font-mono text-[9px] text-white/40">STG {r.stage}</span>
          <span className={`text-[10px] font-semibold leading-tight ${unlocked ? "text-white" : "text-white/30"}`}>
            {unlocked ? r.name : "???"}
          </span>
        </div>
      );
    });

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wide">
        <span className="text-white/40">Stage relics</span>
        <span className="font-mono text-yellow-300/80">
          {unlockedCount}/{RELICS.length} unlocked
        </span>
      </div>
      <div
        className="group relative overflow-hidden motion-reduce:overflow-x-auto"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        {/* per-tile right margin (not flex gap) keeps both halves exactly equal width, so -50% is seamless */}
        <div className="flex w-max motion-safe:animate-relic-roll group-hover:[animation-play-state:paused]">
          {tiles(false)}
          {tiles(true)}
        </div>
      </div>
    </div>
  );
}
