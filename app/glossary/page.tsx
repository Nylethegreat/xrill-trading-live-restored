"use client";

import { useMemo, useState } from "react";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";

type Term = {
  term: string;
  short?: string;
  definition: string;
};

type Category = {
  name: string;
  terms: Term[];
};

const CATEGORIES: Category[] = [
  {
    name: "Risk & Money Management",
    terms: [
      {
        term: "R:R",
        short: "Risk/Reward Ratio",
        definition:
          "How much you stand to make versus how much you're risking. A 2:1 R:R means your target is twice as far away as your stop — XRILL's Trade Plan gate requires at least 2.0 before a setup can pass.",
      },
      {
        term: "SL",
        short: "Stop Loss",
        definition:
          "The price (or premium) where you exit automatically if the trade goes against you — the line that defines how much you're risking before you ever place the trade.",
      },
      {
        term: "TP",
        short: "Take Profit",
        definition: "The price where you plan to exit and lock in a win — your target premium in the XRILL Trade Plan.",
      },
      {
        term: "Breakeven",
        definition:
          "Moving your stop to your entry price once a trade is working, so the position can no longer lose money — common after a Trim.",
      },
      {
        term: "Position Sizing",
        definition:
          "Deciding how many contracts or shares to trade based on your account balance and risk-per-trade percentage, not on how confident you feel.",
      },
      {
        term: "Max Risk",
        definition:
          "The most you're allowed to lose on a single trade — your account balance × your risk-per-trade %. XRILL's Risk Manager blocks any plan that exceeds it.",
      },
      {
        term: "Drawdown",
        definition: "The decline in your account balance from a recent peak, usually tracked as a percentage.",
      },
    ],
  },
  {
    name: "Setup & Confluence",
    terms: [
      {
        term: "Confluence",
        definition:
          "When multiple independent signals — trend, a key level, volume, momentum — all line up in agreement, making a setup more reliable than any single signal alone.",
      },
      {
        term: "Liquidity",
        definition:
          "How easily an asset can be bought or sold without moving the price. Thin liquidity means wide bid-ask spreads that quietly eat into your edge.",
      },
      {
        term: "Support / Resistance",
        definition:
          "Price levels where an asset has repeatedly reversed or stalled in the past — support from below, resistance from above.",
      },
      {
        term: "VWAP",
        short: "Volume-Weighted Average Price",
        definition:
          "The average price an asset has traded at today, weighted by volume — a common intraday reference level for where price is \"expensive\" or \"cheap.\"",
      },
      {
        term: "Trend Alignment",
        definition:
          "Trading in the direction the asset is already moving — e.g. price above the 9/21 EMA for calls, below it for puts.",
      },
      {
        term: "Key Level",
        definition:
          "A specific support, resistance, VWAP, or pre-market price that the market has reacted to before — where you look for a reaction, not just a random price.",
      },
      {
        term: "Volume Expansion",
        definition: "A noticeable increase in trading volume on a candle, signaling real participation behind a move rather than a thin, low-conviction drift.",
      },
    ],
  },
  {
    name: "Options & Execution",
    terms: [
      {
        term: "Premium",
        definition:
          "The price you pay to buy an options contract. One contract always controls 100 shares, so your total cost is premium × 100 × number of contracts.",
      },
      {
        term: "ITM",
        short: "In The Money",
        definition: "An option with intrinsic value — a call whose strike is below the current price, or a put whose strike is above it.",
      },
      {
        term: "OTM",
        short: "Out of The Money",
        definition: "An option with no intrinsic value yet — a call whose strike is above the current price, or a put whose strike is below it. Cheaper, but needs a bigger move to pay off.",
      },
      {
        term: "ATM",
        short: "At The Money",
        definition: "An option whose strike price is essentially equal to the current price of the underlying.",
      },
      {
        term: "0DTE",
        short: "Zero Days to Expiration",
        definition: "An option expiring the same day it's traded — high leverage and high decay, often traded with the full premium at risk instead of a price-based stop.",
      },
      {
        term: "Trim",
        definition: "Selling part of a position — not all of it — to lock in some profit while letting the rest run, often paired with moving your stop to breakeven.",
      },
      {
        term: "Scale Out",
        definition: "Exiting a position in stages at multiple price targets, rather than all at once.",
      },
      {
        term: "Slippage",
        definition: "The difference between the price you expected to get filled at and the price you actually got — usually worse in low-liquidity conditions.",
      },
    ],
  },
  {
    name: "XRILL System",
    terms: [
      {
        term: "XRILL Score",
        definition:
          "The final 0–100 composite score XRILL computes from your Daily Check-In, Trade Gate, Setup Score, Risk Manager, and Execution Check. 80+ is required to authorize a trade.",
      },
      {
        term: "Trade Gate",
        definition: "The five-question readiness check (market open, trading hours, liquidity, news risk, mental state) that has to clear before you can even evaluate a setup.",
      },
      {
        term: "Setup Score",
        definition: "The 25-point, five-item confluence checklist (trend, key level, volume, news, R:R) — 20/25 or better is required to move on to the Trade Plan.",
      },
      {
        term: "Execution Check",
        definition: "The final five-question gate right before submitting — confirmation candle, planned entry, stop already placed, within daily loss limit, and trading the plan instead of emotions.",
      },
      {
        term: "Trade Authorized / Blocked",
        definition: "XRILL's final verdict on a session: Authorized means every gate passed and the trade is cleared to execute; Blocked means at least one gate failed, and the reasons are always shown.",
      },
      {
        term: "Daily Check-In",
        definition: "The first XRILL gate — a quick self-check on sleep, focus, emotional state, and discipline before you're even allowed to look at a setup.",
      },
    ],
  },
];

function AccordionItem({ term, isOpen, onToggle }: { term: Term; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded border border-white/10 bg-surface">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-white">
          {term.term}
          {term.short && <span className="ml-2 text-xs font-normal text-white/40">{term.short}</span>}
        </span>
        <span className={`text-white/40 transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
      </button>
      {isOpen && <p className="border-t border-white/10 px-4 py-3 text-sm text-white/60">{term.definition}</p>}
    </div>
  );
}

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return CATEGORIES;
    return CATEGORIES.map((cat) => ({
      ...cat,
      terms: cat.terms.filter(
        (t) =>
          t.term.toLowerCase().includes(normalized) ||
          t.short?.toLowerCase().includes(normalized) ||
          t.definition.toLowerCase().includes(normalized)
      ),
    })).filter((cat) => cat.terms.length > 0);
  }, [normalized]);

  const totalShown = filtered.reduce((sum, c) => sum + c.terms.length, 0);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-40 opacity-40">
        <CandlestickGlow variant="banner" className="h-full w-full" />
      </div>
      <h1 className="relative font-mono text-xl font-bold tracking-widest text-white">📖 TRADING GLOSSARY</h1>
      <p className="relative mt-1 text-sm text-white/50">
        Plain-language definitions for the terms XRILL and trading in general throw around.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search terms — e.g. R:R, trim, liquidity..."
        className="relative mt-6 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {normalized && (
        <p className="relative mt-2 text-xs text-white/40">
          {totalShown === 0 ? "No terms match." : `${totalShown} term${totalShown === 1 ? "" : "s"} found.`}
        </p>
      )}

      <div className="relative mt-6 space-y-8">
        {filtered.map((cat) => (
          <div key={cat.name}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">{cat.name}</h2>
            <div className="space-y-2">
              {cat.terms.map((t) => (
                <AccordionItem key={t.term} term={t} isOpen={openIds.has(t.term)} onToggle={() => toggle(t.term)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
