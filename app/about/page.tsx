import Link from "next/link";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";
import { Section } from "@/components/Layout";
import { GATES } from "@/lib/data/gates";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What style of trading does this system support?",
    a: "XRILL is built for stock and ETF options buyers — SPY, QQQ, and single-name equities like NVDA or TSLA. Every calculation runs on option premiums: enter what you paid per contract, your stop or target premium, and XRILL computes dollar risk, reward, and R:R automatically (1 contract always controls 100 shares). It's built for intraday, momentum-style setups where a repeatable process matters more than any single trade.",
  },
  {
    q: "Do I need specific software or brokers?",
    a: "No. XRILL doesn't place trades and isn't tied to any broker or charting platform — it's a discipline layer that sits alongside whatever you already use, whether that's TradingView, thinkorswim, NinjaTrader, or something else. You still pull the trigger yourself, in your own platform.",
  },
  {
    q: "Is this a copy-trading bot or an execution framework?",
    a: "Neither, exactly. XRILL doesn't send signals and doesn't execute anything automatically. You bring the trade idea; XRILL runs it through the same eight gates every time and tells you whether you're authorized to take it. The discipline is structural, not automated.",
  },
  {
    q: "What is the recommended starting capital and risk profile?",
    a: "New accounts default to a $50,000 balance, 1% risk per trade (a $500 max loss on a $50k account), and a $1,000 daily loss limit. Those numbers are the actual baseline the Risk Manager gate computes against, and they're adjustable any time in Account Settings.",
  },
  {
    q: "How does the authorization process work?",
    a: "A trade has to clear eight sequential gates — Daily Check-In, Trade Gate, Setup Score, Trade Plan, Risk Manager, Execution Check, XRILL Score, and Authorization. Every gate is recomputed on the server from your actual inputs; failing any one of them blocks the trade and records exactly which gate failed.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-50">
          <CandlestickGlow variant="hero" className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-background/10 via-background/60 to-background" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-mono text-3xl font-bold tracking-widest text-white">ABOUT XRILL</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            XRILL isn't a signal service and it isn't a bot. It's a gate — the same eight questions, asked in
            the same order, every single time, before a trade ever gets your authorization to execute.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-20">
        <Section title="🎯 Why XRILL Exists">
          <div className="space-y-3 text-sm leading-relaxed text-white/80">
            <p>
              Most trading losses aren't caused by bad setups — they're caused by good setups traded badly:
              revenge-sizing after a loss, skipping the stop because "it'll come back," taking a trade on no
              sleep and too much adrenaline. The setup was never the weak link. The process around it was.
            </p>
            <p>
              XRILL was built to remove that weak link. Instead of trusting willpower in the moment a trade
              looks tempting, every trade — no exceptions — runs through the same sequential authorization
              gates: readiness, market conditions, setup quality, a valid plan, a risk-approved position size,
              and clean execution. If any gate fails, the trade is blocked and the reason is logged. There's no
              override, no "just this once."
            </p>
            <p>
              That's the whole idea: discipline as a structural property of the system, not a personality trait
              you're hoping to have on your worst day.
            </p>
          </div>
        </Section>

        <Section title="⚖️ Process Over Outcome" subtitle="Selectivity is the point, not a side effect">
          <p className="text-sm leading-relaxed text-white/80">
            Long-term trading results come from risk mitigation, strict invalidation levels, and saying no to
            most setups — not from chasing a 100% win rate. A system that authorizes everything isn't
            disciplined, it's just permissive. XRILL is deliberately selective: it's supposed to block a lot of
            sessions. If your XRILL score or authorization rate feels low at first, that's the gate working, not
            failing.
          </p>
        </Section>

        <Section title="🧭 Who It's Built For">
          <p className="text-sm leading-relaxed text-white/80">
            Serious retail traders who want structure, accountability, and institutional-style risk caps applied
            to their own trading — not a black box, and not a signal feed to follow blindly. If you want to
            understand exactly why a trade was or wasn't authorized, and you're willing to let a daily loss
            limit and a risk manager actually stop you, XRILL is built for that.
          </p>
        </Section>

        <Section title="🔒 The Gate, Explained">
          <div className="space-y-2">
            {GATES.map((g) => (
              <div key={g.n} className="flex gap-3 rounded border border-white/10 bg-surface p-3 text-sm">
                <span className="font-mono text-white/40">{g.n}</span>
                <div>
                  <p className="font-medium text-white">{g.name}</p>
                  <p className="text-white/60">{g.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="🔥 What 'Streak' Means" subtitle="The number next to LVL on your dashboard">
          <div className="space-y-1.5 text-sm">
            {[
              ["0 streak", "Your last session was blocked — no shame, that's the system working."],
              ["1–2 streak", "You're on a roll. Keep the same discipline that got you here."],
              ["3+ streak", "Streaking — this is when the HUD starts to glow. Don't force a trade just to protect it."],
            ].map(([label, desc]) => (
              <div key={label} className="flex gap-3 rounded border border-white/10 bg-surface p-2.5">
                <span className="w-24 flex-none font-mono text-xs text-accent">{label}</span>
                <span className="text-white/60">{desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/40">
            Streak = consecutive most-recent sessions that were authorized (cleared all 8 gates), counting back
            from today. One blocked session resets it to 0 — it isn't a win/loss P&L streak.
          </p>
        </Section>

        <Section title="📊 Performance Transparency" subtitle="What gets measured, not a highlight reel">
          <div className="space-y-3 text-sm leading-relaxed text-white/80">
            <p>
              XRILL doesn't post cherry-picked winning trades. Every session — authorized or blocked — is
              recorded, and every authorized trade can be journaled with its real P/L, whether the plan and exit
              rules were actually followed, and what the lesson was. Three numbers matter more than any single
              trade:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li><span className="text-white">Authorization rate</span> — the percentage of sessions that actually clear every gate. Low is a feature, not a bug.</li>
              <li><span className="text-white">Average risk/reward</span> — the Trade Plan gate rejects anything under 2.0 by design.</li>
              <li><span className="text-white">Execution compliance</span> — how often the plan and exit rules were actually followed once a trade was authorized.</li>
            </ul>
            <p>
              These aren't marketing numbers — they're computed live from your own recorded sessions on{" "}
              <Link href="/analytics" className="text-primary underline">Analytics</Link> and{" "}
              <Link href="/intelligence" className="text-primary underline">Intelligence</Link> once you're
              signed in, not asserted here.
            </p>
          </div>
        </Section>

        <Section title="🚀 Quick Start">
          <ol className="space-y-2 text-sm text-white/80">
            <li className="rounded border border-white/10 bg-surface p-3"><span className="font-mono text-white/40">1 —</span> Complete your Daily Check-In and clear the Trade Gate.</li>
            <li className="rounded border border-white/10 bg-surface p-3"><span className="font-mono text-white/40">2 —</span> Score the setup and enter your Trade Plan — entry, stop, target, contracts.</li>
            <li className="rounded border border-white/10 bg-surface p-3"><span className="font-mono text-white/40">3 —</span> Execute only if Authorized, then record the real outcome in your Journal.</li>
          </ol>
          <Link
            href="/login"
            className="mt-4 inline-block rounded bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Get started
          </Link>
        </Section>

        <Section title="❓ FAQ">
          <div className="divide-y divide-white/10 rounded border border-white/10 bg-surface">
            {FAQS.map((f) => (
              <details key={f.q} className="group p-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-white marker:content-none">
                  <span className="mr-2 inline-block text-white/40 transition-transform group-open:rotate-90">▸</span>
                  {f.q}
                </summary>
                <p className="mt-2 pl-5 text-sm leading-relaxed text-white/70">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section title="⚠️ Risk Disclosure">
          <div className="space-y-2 rounded border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/50">
            <p>
              Trading futures and options involves substantial risk of loss and is not suitable for all
              investors. Past performance — including any authorization rate, risk/reward figure, or session
              statistic shown in this app — is not indicative of future results.
            </p>
            <p>
              XRILL is an informational and educational tool that structures your own decision-making process.
              It does not place trades, manage funds, or provide individualized investment advice, and nothing
              in this app should be construed as a recommendation to buy or sell any security or derivative.
              You are solely responsible for your own trading decisions.
            </p>
            <p>
              This disclosure is a general framework, not a substitute for review by a qualified securities or
              CFTC-compliance attorney before this product is offered commercially.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
