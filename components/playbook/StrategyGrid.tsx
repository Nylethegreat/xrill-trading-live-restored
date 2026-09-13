"use client";

import { useMemo, useState } from "react";
import { STRATEGIES, STRATEGY_CATEGORIES, type StrategyCategory } from "@/lib/data/strategies";
import Badge from "@/components/Badge";

const CATEGORY_TONE: Record<StrategyCategory, "info" | "good" | "loss" | "caution" | "neutral"> = {
  Trend: "info",
  "Breakout & Continuation": "good",
  Reversal: "loss",
  VWAP: "caution",
  "Context & Events": "neutral",
};

export default function StrategyGrid() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StrategyCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STRATEGIES.filter((s) => {
      const matchesCategory = category === "All" || s.category === category;
      const matchesQuery = q === "" || s.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search strategies…"
          className="w-full rounded border border-white/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-accent sm:w-64"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("All")}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              category === "All" ? "border-accent bg-accent/15 text-accent" : "border-white/20 text-white/60 hover:text-white"
            }`}
          >
            All
          </button>
          {STRATEGY_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                category === c ? "border-accent bg-accent/15 text-accent" : "border-white/20 text-white/60 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.name} className="rounded border border-white/10 bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-white">{s.name}</span>
              <Badge tone={s.bias === "Bullish" ? "good" : s.bias === "Bearish" ? "loss" : "neutral"}>{s.bias}</Badge>
            </div>
            <div className="mt-1.5">
              <Badge tone={CATEGORY_TONE[s.category]}>{s.category}</Badge>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/60">{s.definition}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded border border-white/10 bg-surface p-4 text-sm text-white/40">
            No strategies match that search.
          </p>
        )}
      </div>
    </div>
  );
}
