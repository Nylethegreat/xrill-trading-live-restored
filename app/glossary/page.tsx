"use client";

import { useMemo, useState } from "react";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";
import RiverGlow from "@/components/visuals/RiverGlow";
import { STRATEGIES } from "@/lib/data/strategies";
import { GREEKS } from "@/lib/data/greeks";
import { TRADING_STYLES } from "@/lib/data/trading-styles";

type Term = {
  term: string;
  short?: string;
  definition: string;
};

type Category = {
  name: string;
  terms: Term[];
};

const OTHER_SIDE = "Who’s on the Other Side";

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
  {
    name: "Progress & Levels",
    terms: [
      {
        term: "LVL (Level)",
        definition:
          "Which rung of the Double-Up Ladder your account balance is currently on ($250 → $500 → $1,000 → $2,000 → $5,000, 5 levels total). This is what the EXP bar on your Dashboard tracks, and it's separate from the two entries below.",
      },
      {
        term: "Streak",
        definition:
          "Consecutive most-recent sessions that were authorized (cleared all 8 gates), counting back from today. One blocked session resets it to 0 — see the About page for the full 0 / 1-2 / 3+ breakdown.",
      },
      {
        term: "Twelve-Stage Compounding Roadmap",
        definition:
          "The Playbook's real position-sizing framework, from a $250 start cap all the way to $1,000,000 across 12 stages — much larger in scope than the 5-level Double-Up Ladder, and what actually governs allocation as the account grows.",
      },
      {
        term: "Star Unlocks",
        definition:
          "Three cosmetic badges on the Playbook page (Purple $100k, Rainbow $250k, Prismatic $1M) tied to real account balance milestones — a separate reward layer from both LVL and the Twelve-Stage roadmap, not a required step in either.",
      },
    ],
  },
  {
    name: OTHER_SIDE,
    terms: [
      {
        term: "Market Maker",
        short: "\"The House\"",
        definition:
          "The firm quoting the bid and ask on almost every option you trade, and usually the one that sells you the contract. They mostly aren't betting against your direction — they hedge with shares and earn the spread. You pay the house on every trade through that spread, win or lose; when an option you bought expires worthless, the premium you paid is what they keep.",
      },
      {
        term: "Short Sellers",
        definition:
          "Traders who borrowed shares and sold them, betting price falls. When your call or long stock rips, part of that fuel is shorts being forced to buy back (a short squeeze) — their loss is your gain. When your puts pay, you're on the same side as them.",
      },
      {
        term: "The Other Buyers",
        short: "Retail & late money",
        definition:
          "In stocks, your profit is paid by the next person willing to pay a higher price than you did. Your loss usually means you were that next person — the late buyer who chased. If you can't name who buys after you, you might be the exit liquidity.",
      },
      {
        term: "Quantitative Hedge Funds",
        short: "The algorithms",
        definition:
          "Funds running computer models that trade thousands of times a day on tiny, repeatable edges: spreads, order flow, and predictable human behavior like chasing breakouts and stops clustered at obvious levels. Slippage, stop runs and fake-outs are often where they collect from retail.",
      },
      {
        term: "Option Sellers",
        short: "Premium sellers",
        definition:
          "Anyone who writes (sells) options to collect premium — funds, market makers and some retail. Time decay works for them and against you as a buyer: every day your trade goes nowhere, theta moves money from your contract to the seller.",
      },
      {
        term: "Zero-Sum",
        short: "Where every dollar comes from",
        definition:
          "Options are zero-sum before fees: every dollar one side makes, the other side loses — then the house takes its cut on top. Short-term stock trading is close to the same. So every win came out of someone else's mistake, and every loss went to someone with a better plan. XRILL's gates exist to keep you off the paying side.",
      },
      {
        term: "Bid-Ask Spread",
        short: "The house's cut",
        definition:
          "The gap between what buyers pay (ask) and sellers get (bid). Buy at the ask and sell at the bid immediately, and you lose the spread instantly. On thin options that gap can be 10%+ of the premium — a cost you pay before the trade even moves.",
      },
    ],
  },
  {
    name: "Psychology",
    terms: [
      {
        term: "Revenge Trading",
        definition:
          "Jumping straight into another trade to win back a loss — usually bigger, faster and with no real setup. It's the single most common way a bad day turns into a blown account.",
      },
      {
        term: "FOMO",
        short: "Fear Of Missing Out",
        definition:
          "Chasing a move because it's already running and you don't want to miss it. FOMO entries are late, have wide stops and poor R:R — exactly what XRILL's Setup Score is built to catch.",
      },
      {
        term: "Tilt",
        definition:
          "An emotional state (frustration, anger, euphoria) where you stop following your rules. Borrowed from poker. If you notice it, the trade is to walk away, not to click buy.",
      },
      {
        term: "Overtrading",
        definition:
          "Taking more trades than your setups justify — out of boredom, excitement or to force a daily goal. More trades means more fees, more mistakes and more exposure to bad fills.",
      },
      {
        term: "Two-Loss Lockout",
        definition:
          "XRILL's hard stop for the day: after two journaled stop-outs, Start Session locks until midnight Eastern. It exists because the third trade after two losses is where most revenge trading happens.",
      },
    ],
  },
  {
    name: "The Greeks",
    terms: GREEKS.map((g) => ({
      term: g.name,
      short: `${g.symbol} · ${g.tagline}`,
      definition: `${g.definition} ${g.takeaway}`,
    })),
  },
  {
    name: "Trading Styles by Holding Time",
    terms: TRADING_STYLES.map((s) => ({
      term: s.name,
      short: s.holdingTime,
      definition: s.definition,
    })),
  },
  {
    name: "Strategy Library",
    terms: STRATEGIES.map((s) => ({
      term: s.name,
      short: `${s.category} · ${s.bias}`,
      definition: s.definition,
    })),
  },
];

// Each category's accent, as "R G B" so one CSS variable (--acc) drives the
// border, tag, corner brackets and glow with any alpha. All colors come
// from the app's existing palette (tailwind.config.ts tokens + Tailwind
// defaults) so the glossary matches the rest of XRILL.
const ACCENTS: Record<string, string> = {
  "Risk & Money Management": "34 197 94", // accent green
  "Setup & Confluence": "59 130 246", // primary blue
  "Options & Execution": "34 211 238", // daytrade cyan
  "XRILL System": "168 85 247", // blocked purple
  "Progress & Levels": "234 179 8", // caution yellow
  Psychology: "244 114 182", // pink-400
  [OTHER_SIDE]: "239 68 68", // red-500 -- the counterparty
  "The Greeks": "192 38 211", // secondary magenta
  "Trading Styles by Holding Time": "251 146 60", // orange-400
  "Strategy Library": "45 212 191", // teal-400
};
const accentFor = (category: string) => ACCENTS[category] ?? "148 163 184";

// Shorter labels for the pills; the full name still shows on each card.
const PILL_LABELS: Record<string, string> = {
  "Risk & Money Management": "Risk & Money",
  "Setup & Confluence": "Setup",
  "Options & Execution": "Options",
  "XRILL System": "XRILL System",
  "Progress & Levels": "Progress",
  Psychology: "Psychology",
  [OTHER_SIDE]: "Other Side",
  "The Greeks": "Greeks",
  "Trading Styles by Holding Time": "Trading Styles",
  "Strategy Library": "Strategies",
};

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const place = {
    tl: "left-0 top-0 border-l-2 border-t-2",
    tr: "right-0 top-0 border-r-2 border-t-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  }[pos];
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-3 w-3 border-[rgb(var(--acc)/0.55)] transition-all duration-200 group-hover:h-4 group-hover:w-4 group-hover:border-[rgb(var(--acc))] group-hover:drop-shadow-[0_0_6px_rgb(var(--acc))] ${place}`}
    />
  );
}

function HudCard({
  term,
  category,
  isOpen,
  onToggle,
}: {
  term: Term;
  category: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      style={{ "--acc": accentFor(category) } as React.CSSProperties}
      className="group relative flex h-full w-full flex-col rounded-sm border border-[rgb(var(--acc)/0.28)] bg-[#0b0e1a]/70 p-4 text-left transition-all duration-200 hover:border-[rgb(var(--acc)/0.85)] hover:shadow-[0_0_18px_-4px_rgb(var(--acc)/0.6)] md:backdrop-blur-md"
    >
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-base font-bold tracking-wide text-white [text-shadow:0_0_10px_rgb(var(--acc)/0.45)]">
          {term.term}
        </span>
        <span className="shrink-0 rounded-full border border-[rgb(var(--acc)/0.4)] bg-[rgb(var(--acc)/0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[rgb(var(--acc))]">
          {PILL_LABELS[category] ?? category}
        </span>
      </div>
      {term.short && <p className="mt-1 text-xs font-medium text-white/60">{term.short}</p>}
      <p className={`mt-2 text-sm leading-relaxed text-white/55 ${isOpen ? "" : "line-clamp-2"}`}>{term.definition}</p>
      <span className="mt-auto pt-2 text-[10px] uppercase tracking-widest text-[rgb(var(--acc)/0.6)]">
        {isOpen ? "− Collapse" : "+ Expand"}
      </span>
    </button>
  );
}

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("All");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const normalized = query.trim().toLowerCase();

  const matches = (t: Term) =>
    !normalized ||
    t.term.toLowerCase().includes(normalized) ||
    t.short?.toLowerCase().includes(normalized) ||
    t.definition.toLowerCase().includes(normalized);

  // Counts follow the search, so each pill shows how many hits it holds.
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    let all = 0;
    for (const cat of CATEGORIES) {
      const n = cat.terms.filter(matches).length;
      c[cat.name] = n;
      all += n;
    }
    c.All = all;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized]);

  const cards = useMemo(
    () =>
      CATEGORIES.filter((cat) => active === "All" || cat.name === active).flatMap((cat) =>
        cat.terms.filter(matches).map((t) => ({ term: t, category: cat.name, id: `${cat.name}::${t.term}` }))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalized, active]
  );

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pills = ["All", ...CATEGORIES.map((c) => c.name)];

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-40 opacity-40">
        <CandlestickGlow variant="banner" className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute -left-24 top-0 hidden h-[880px] w-20 opacity-80 xl:block">
        <RiverGlow />
      </div>
      <h1 className="relative font-mono text-xl font-bold tracking-widest text-white">📖 TRADING GLOSSARY</h1>
      <p className="relative mt-1 text-sm text-white/50">
        Plain-language definitions for the terms XRILL and trading in general throw around.
      </p>

      <button
        type="button"
        onClick={() => {
          setQuery("");
          setActive(OTHER_SIDE);
        }}
        style={{ "--acc": accentFor(OTHER_SIDE) } as React.CSSProperties}
        className="relative mt-5 block w-full rounded border border-[rgb(var(--acc)/0.35)] bg-[rgb(var(--acc)/0.06)] p-3 text-left transition-shadow hover:shadow-[0_0_16px_-4px_rgb(var(--acc)/0.7)]"
      >
        <span className="text-sm font-semibold text-[rgb(var(--acc))]">Won or lost on a trade? Ask where the money came from.</span>
        <span className="mt-0.5 block text-xs text-white/60">
          Every dollar you make is paid by someone on the other side — the house, short sellers, other buyers, the
          algorithms. Every dollar you lose goes to one of them. Tap to meet them →
        </span>
      </button>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search terms — e.g. R:R, trim, liquidity..."
        className="relative mt-6 w-full rounded border border-white/20 bg-[#0b0e1a]/70 px-3 py-2.5 text-sm outline-none transition-shadow focus:border-accent focus:shadow-[0_0_14px_-2px_rgba(34,197,94,0.6)]"
      />

      <div className="relative mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {pills.map((name) => {
          const isActive = active === name;
          const acc = name === "All" ? "232 234 245" : accentFor(name);
          const n = counts[name] ?? 0;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(name)}
              style={{ "--acc": acc } as React.CSSProperties}
              className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm transition-all ${
                isActive
                  ? "border-[rgb(var(--acc))] bg-[rgb(var(--acc)/0.15)] text-[rgb(var(--acc))] shadow-[0_0_14px_-2px_rgb(var(--acc)/0.75)]"
                  : "border-white/15 bg-white/[0.03] text-white/55 hover:border-[rgb(var(--acc)/0.6)] hover:text-white/85 hover:shadow-[0_0_10px_-3px_rgb(var(--acc)/0.6)]"
              } ${n === 0 && !isActive ? "opacity-40" : ""}`}
            >
              {name === "All" ? "All" : PILL_LABELS[name] ?? name}
              <span className="ml-1.5 font-mono text-[10px] opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <p className="relative mt-3 text-xs text-white/40">
        {cards.length === 0
          ? "No terms match."
          : `${cards.length} term${cards.length === 1 ? "" : "s"}${active === "All" ? "" : ` in ${active}`}${normalized ? ` matching "${query.trim()}"` : ""}`}
      </p>

      <div className="relative mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <HudCard
            key={c.id}
            term={c.term}
            category={c.category}
            isOpen={openIds.has(c.id)}
            onToggle={() => toggle(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
