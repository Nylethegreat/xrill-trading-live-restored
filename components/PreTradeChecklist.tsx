"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  { key: "risk", label: "Max risk is 2–5% of account or less" },
  { key: "stop", label: "Hard stop is already set" },
  { key: "setup", label: "Setup criteria confirmed" },
  { key: "revenge", label: "Zero revenge trading — this isn't chasing a loss" },
] as const;

// A quick gut-check gate in front of the full XRILL session wizard. It's
// intentionally separate from (and lighter than) the wizard's own Daily
// Check-In / Trade Gate / Execution Check gates — this is the "before you
// even open the wizard" pass, not a replacement for the real thing.
export default function PreTradeChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const allChecked = ITEMS.every((item) => checked[item.key]);

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="rounded border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Pre-Trade Checklist</h2>
      <div className="mt-3 space-y-2">
        {ITEMS.map((item) => {
          const isChecked = !!checked[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className={`flex w-full items-center gap-3 rounded border p-2.5 text-left text-sm transition-colors ${
                isChecked ? "border-accent bg-accent/10 text-white" : "border-white/10 text-white/70 hover:border-white/25"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                  isChecked ? "border-accent bg-accent text-black" : "border-white/30 text-transparent"
                }`}
              >
                ✓
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      {allChecked ? (
        <Link
          href="/session"
          className="mt-4 block rounded bg-accent px-4 py-2 text-center text-sm font-medium text-black hover:opacity-90"
        >
          🚀 Start XRILL Session
        </Link>
      ) : (
        <div
          aria-disabled="true"
          className="mt-4 cursor-not-allowed rounded bg-white/10 px-4 py-2 text-center text-sm font-medium text-white/40"
        >
          🚀 Start XRILL Session — check all 4 items first
        </div>
      )}
    </div>
  );
}
