import Link from "next/link";
import HeaderText from "@/components/HeaderText";
import LadderCalculator from "@/components/playbook/LadderCalculator";
import ZeroDteGreeks from "@/components/playbook/ZeroDteGreeks";
import {
  ZERO_DTE_DAILY_MAX,
  ZERO_DTE_ENTRY_CUTOFF_MIN,
  ZERO_DTE_FLAT_BY_MIN,
  formatEtMinutes,
} from "@/lib/zeroDte";

const RULES = [
  {
    title: "Contracts come from the risk budget",
    body: "Never pick a contract count because it feels right. The engine divides your max trade risk by what each contract can lose at the stop. Cheaper premium (still near the money) means more contracts, and more contracts means a real ladder.",
  },
  {
    title: "Pay back the cost first",
    body: "Sell half (rounded up) at +100%. That returns at least what you paid for the whole position, so from there the trade can't lose money. Move the runner's stop to breakeven.",
  },
  {
    title: "Bank one, run one",
    body: "With 2+ contracts left, sell one more at +200%. Whatever's left is the runner: trailed under structure (prior 5-minute low for calls, high for puts). It exits on the trail or the clock, never on a feeling.",
  },
  {
    title: "SPY and QQQ, near the money",
    body: "Tight spreads and real volume. Strikes around 0.20–0.35 delta. A 0.05-delta $0.03 contract isn't cheap, it's dead.",
  },
  {
    title: `No entries after ${formatEtMinutes(ZERO_DTE_ENTRY_CUTOFF_MIN)} ET`,
    body: `Theta and gamma both go vertical in the last hour. XRILL won't authorize a new 0DTE entry after the cutoff. Be flat by ${formatEtMinutes(ZERO_DTE_FLAT_BY_MIN)}.`,
  },
  {
    title: `Max ${ZERO_DTE_DAILY_MAX} a day`,
    body: "0DTE is where overtrading happens fastest. Two shots, both counted toward your Daily Trade Cap and your Two-Loss Lockout. Enforced by the engine.",
  },
];

export default function ZeroDtePlaybookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <HeaderText className="font-mono text-xl font-bold tracking-widest">0DTE LANE</HeaderText>
      <p className="mt-1 text-sm text-white/50">
        Same-day options, multiple contracts, and an exit ladder that lets you hold a runner without holding your breath.
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Why multiple contracts</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          One contract is all-or-nothing. Every runner turns into a test of nerve: sell now and maybe miss the 400%, or hold
          and maybe watch it go to zero. With two or more, you don&apos;t have to choose. You pay yourself back at +100%, and
          what&apos;s left is running on house money. That&apos;s how you catch a 471% day without the stress that makes you
          sell at +60%.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {RULES.map((r) => (
          <div key={r.title} className="rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-semibold text-accent">{r.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">{r.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <LadderCalculator />
      </div>

      <div className="mt-10">
        <h2 className="font-mono text-sm font-bold tracking-widest text-white">THE GREEKS ON EXPIRATION DAY</h2>
        <p className="mt-1 text-sm text-white/50">Why the rules above exist.</p>
        <div className="mt-4">
          <ZeroDteGreeks />
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        Chop day and nothing&apos;s trending? That&apos;s not a 0DTE day.{" "}
        <Link href="/playbook/verticals" className="text-accent underline">
          See Verticals & Chop →
        </Link>
      </div>
    </div>
  );
}
