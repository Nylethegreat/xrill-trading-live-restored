"use client";

import { usePersistentChoice } from "@/lib/usePersistentChoice";
import BlueprintTexture from "@/components/visuals/textures/BlueprintTexture";
import QuestMapTexture from "@/components/visuals/textures/QuestMapTexture";

// Per-visitor /blueprint backdrop (remembered in this browser): the
// architect's blueprint (default, fits the page's name) or the original
// Quest Map.
type BlueprintBg = "blueprint" | "quest_map";
const IDS: readonly BlueprintBg[] = ["blueprint", "quest_map"];

const OPTIONS: { id: BlueprintBg; label: string; swatch: string }[] = [
  { id: "blueprint", label: "Blueprint", swatch: "repeating-linear-gradient(90deg,#2a5fc6 0 3px,#ffffff66 3px 4px),#2a5fc6" },
  { id: "quest_map", label: "Quest Map", swatch: "radial-gradient(circle,#bfdbfe 0 12%,#2563eb 30%,#0f172a 70%)" },
];

export default function BlueprintBackdrop() {
  const [bg, setBg, hydrated] = usePersistentChoice<BlueprintBg>("xrill-blueprint-bg", IDS, "blueprint");

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20">
        {hydrated && bg === "blueprint" && (
          <>
            <BlueprintTexture idPrefix="bp-page" className="opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/60" />
          </>
        )}
        {hydrated && bg === "quest_map" && (
          <>
            <QuestMapTexture idPrefix="quest-blueprint" className="opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/75" />
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">Backdrop</span>
        {OPTIONS.map((o) => {
          const active = o.id === bg;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => setBg(o.id)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] backdrop-blur-sm transition ${
                active ? "border-white/60 bg-white/15 text-white" : "border-white/20 bg-black/30 text-white/70 hover:border-white/40"
              }`}
            >
              <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: o.swatch }} />
              {o.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
