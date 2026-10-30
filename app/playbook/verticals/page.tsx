import Link from "next/link";
import HeaderText from "@/components/HeaderText";

// Verticals & Chop: what to do on a day with no trend instead of forcing a
// long call or put. Debit spreads are supported in the engine (Position
// Structure -> Vertical Spread); credit spreads are taught here but not
// modeled yet (see lib/structures.ts).

const CHOP_TELLS = [
  "Price keeps crossing VWAP back and forth instead of riding one side of it.",
  "Candles overlap: each one's range sits inside the last few.",
  "Stuck between yesterday's high and low, or a tight pre-market range.",
  "Volume is light and breakouts fail within a few candles.",
];

interface Example {
  title: string;
  tone: "primary" | "caution";
  when: string;
  how: string;
  legs: string[];
  math: [string, string][];
  rules: string[];
}

const EXAMPLES: Example[] = [
  {
    title: "Debit spread (bull call / bear put)",
    tone: "primary",
    when: "You have a direction, but it's a grind, not a rip. Paying full price for a naked call would mean fighting theta all day.",
    how: "Buy one strike and sell a further out-of-the-money strike, same type and same expiration. The one you sell pays for part of the one you buy.",
    legs: ["Buy SPY 580 call @ $3.00", "Sell SPY 585 call @ $1.20"],
    math: [
      ["Net debit (your cost)", "$1.80 × 100 = $180"],
      ["Max loss", "$180 (the debit)"],
      ["Max profit", "($5 width − $1.80) × 100 = $320"],
      ["Breakeven at expiry", "$581.80"],
    ],
    rules: [
      "Cheaper than the naked call and decays slower, because the short leg's theta works for you.",
      "Profit is capped at the width. That's the trade: you give up the 400% day in exchange for not needing one.",
      "Runs through the XRILL engine today: Position Structure → Vertical Spread. Your stop and target are on the spread's value.",
    ],
  },
  {
    title: "Credit spread (bear call / bull put)",
    tone: "caution",
    when: "Price is boxed in and you expect it to stay below resistance (bear call) or above support (bull put). You get paid for time passing.",
    how: "Sell an option at or beyond the level, and buy one further out as protection. You collect a credit up front; the bought leg caps how much you can lose.",
    legs: ["Sell SPY 590 call @ $1.10 (above resistance)", "Buy SPY 595 call @ $0.40 (the protection)"],
    math: [
      ["Credit received", "$0.70 × 100 = $70"],
      ["Max loss", "($5 width − $0.70) × 100 = $430"],
      ["Max profit", "$70 (keep the credit)"],
      ["Breakeven at expiry", "$590.70"],
    ],
    rules: [
      "Flipped risk/reward: you risk more than you make, in exchange for winning more often. The engine's 2:1 R:R rule doesn't apply here, so judge it on the level, not the ratio.",
      "Take profit around 50% of the credit. Holding for the last few dollars is how a winner turns into a max loss.",
      "Exit if price closes through your short strike's level. Don't wait to see if it comes back.",
      "Needs a higher options approval level and margin at most brokers. Watch for assignment if the short leg goes in the money near expiration.",
      "Not modeled in the XRILL engine yet. Log it after the fact for now so it still counts toward your cap.",
    ],
  },
];

const TONE: Record<Example["tone"], { border: string; text: string }> = {
  primary: { border: "border-primary/30", text: "text-primary" },
  caution: { border: "border-caution/30", text: "text-caution" },
};

export default function VerticalsPlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <HeaderText className="font-mono text-xl font-bold tracking-widest">VERTICALS & CHOP</HeaderText>
      <p className="mt-1 text-sm text-white/50">
        What to do on a day with no trend, instead of forcing a long call or put and paying theta to wait.
      </p>

      <div className="mt-6 rounded-xl border border-loss/30 bg-loss/10 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-loss">The urge to force it</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Chop is where naked long options go to die. You buy a call, it goes sideways for two hours, theta eats 30%, and
          you sell right before it finally moves. If you catch yourself scanning for <em>any</em> trade, that feeling is the
          signal. You have three honest choices: a spread that fits the range, a smaller size, or no trade. Sitting out is
          a position.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">How to spot chop</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-white/70">
          {CHOP_TELLS.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 space-y-5">
        {EXAMPLES.map((e) => {
          const c = TONE[e.tone];
          return (
            <div key={e.title} className={`rounded-xl border ${c.border} bg-surface p-5`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wide ${c.text}`}>{e.title}</h2>
              <p className="mt-2 text-sm text-white/80">
                <span className="text-white/50">When: </span>
                {e.when}
              </p>
              <p className="mt-1.5 text-sm text-white/80">
                <span className="text-white/50">How: </span>
                {e.how}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/40">Example legs (illustrative)</p>
                  <ul className="mt-1.5 space-y-1 font-mono text-xs text-white/80">
                    {e.legs.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-white/40">The math</p>
                  <dl className="mt-1.5 space-y-1 text-xs">
                    {e.math.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <dt className="text-white/50">{k}</dt>
                        <dd className="font-mono text-white/85">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-white/70">
                {e.rules.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Small accounts, honestly</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          Size by max loss, same as everything else. On a $100–$500 account, a $5-wide credit spread risking $430 doesn&apos;t
          fit, and a $1-wide one barely does. Debit spreads are the realistic chop tool at that size: you know your max loss
          the moment you enter, and it&apos;s the debit. Never sell naked options. A short call has no ceiling on what it can
          lose, and one gap can end the challenge.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        Trending day with a clean level?{" "}
        <Link href="/playbook/zero-dte" className="text-accent underline">
          That&apos;s the 0DTE lane →
        </Link>
      </div>
    </div>
  );
}
