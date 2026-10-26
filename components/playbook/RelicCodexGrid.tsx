"use client";

import { useState } from "react";
import RelicIcon from "@/components/visuals/RelicIcon";
import { RELICS, RELIC_CODEX } from "@/lib/data/relics";
import { usePersistentChoice } from "@/lib/usePersistentChoice";

// The Codex grid. Locked relics are silhouettes until the real balance
// clears their stage -- but anyone can PREVIEW the art: flip "Preview locked
// relics" for all of them, or tap a single silhouette to peek at just that
// one. Previewing never marks anything unlocked; the card keeps its LOCKED
// tag and neutral border.
const PREVIEW_IDS = ["off", "on"] as const;

export default function RelicCodexGrid({ balance }: { balance: number }) {
  const [preview, setPreview] = usePersistentChoice<(typeof PREVIEW_IDS)[number]>("xrill-relic-preview", PREVIEW_IDS, "off");
  const [peeks, setPeeks] = useState<Set<string>>(new Set());
  const lockedCount = RELICS.filter((r) => balance < r.unlockAt).length;

  function togglePeek(id: string) {
    setPeeks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      {lockedCount > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-black/40 p-3 backdrop-blur-sm">
          <button
            type="button"
            role="switch"
            aria-checked={preview === "on"}
            onClick={() => setPreview(preview === "on" ? "off" : "on")}
            className="flex items-center gap-2 text-sm text-white/80"
          >
            <span className={`relative h-5 w-9 rounded-full transition-colors ${preview === "on" ? "bg-yellow-400/80" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${preview === "on" ? "left-[18px]" : "left-0.5"}`} />
            </span>
            👁 Preview locked relics
          </button>
          <span className="text-xs text-white/40">
            See what you&apos;re working toward. Or tap any silhouette to peek at just that one. Unlocking still takes the real balance.
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {RELICS.map((r) => {
          const got = balance >= r.unlockAt;
          const showing = got || preview === "on" || peeks.has(r.id);
          const c = RELIC_CODEX[r.id];
          return (
            <article
              key={r.id}
              id={r.id}
              className="relative rounded-xl border bg-black/50 p-5 backdrop-blur-sm"
              style={{ borderColor: got ? `${r.color}66` : "rgba(255,255,255,0.1)", boxShadow: got ? `0 0 24px ${r.color}22` : undefined }}
            >
              <div className="flex items-start gap-4">
                {got ? (
                  <RelicIcon id={r.id} unlocked size={52} glow={r.color} />
                ) : (
                  <button
                    type="button"
                    onClick={() => togglePeek(r.id)}
                    aria-pressed={showing}
                    aria-label={showing ? `Hide ${r.name} preview` : `Peek at ${r.name}`}
                    title={showing ? "Hide preview" : "Tap to peek"}
                    className="relative flex-none rounded-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                  >
                    <span className={showing ? "block opacity-80 saturate-[0.85]" : "block"}>
                      <RelicIcon id={r.id} unlocked={showing} size={52} />
                    </span>
                    <span aria-hidden="true" className="absolute -bottom-1 -right-1 rounded-full bg-black/80 px-1 text-[10px]">
                      {showing ? "👁" : "🔒"}
                    </span>
                  </button>
                )}
                <div className="min-w-0">
                  <div className="font-mono text-[11px] tracking-widest text-white/40">
                    STAGE {r.stage} · {r.realm === "all" ? "ALL REALMS" : r.realm.toUpperCase()} · ${r.unlockAt.toLocaleString()}
                  </div>
                  <h2 className="mt-0.5 text-lg font-semibold text-white">{r.name}</h2>
                  <div className="text-xs italic" style={{ color: r.color }}>
                    {c.kind}
                  </div>
                </div>
                {got ? (
                  <span className="ml-auto rounded-full border border-yellow-300/40 px-2 py-0.5 font-mono text-[10px] text-yellow-200">UNLOCKED</span>
                ) : (
                  showing && (
                    <span className="ml-auto whitespace-nowrap rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] text-white/50">
                      PREVIEW · LOCKED
                    </span>
                  )
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{c.essence}</p>
              <p className="mt-3 border-t border-white/10 pt-3 text-sm text-white/90">
                <span className="mr-2 font-mono text-[10px] tracking-widest text-white/40">VOW</span>“{c.vow}”
              </p>
              <p className="mt-2 text-xs text-white/40">{r.lore}</p>
            </article>
          );
        })}
      </div>
    </>
  );
}
