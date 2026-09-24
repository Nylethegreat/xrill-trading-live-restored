import Badge from "@/components/Badge";
import CompoundScalingRoadmap from "@/components/playbook/CompoundScalingRoadmap";
import ExecutionCompoundingExamples from "@/components/playbook/ExecutionCompoundingExamples";
import SuperStar from "@/components/visuals/SuperStar";
import StarUnlocks from "@/components/playbook/StarUnlocks";
import BouncingStarsToggle from "@/components/visuals/BouncingStarsToggle";
import { SCALING_PRINCIPAL, WEEKLY_RATE_PLANS } from "@/lib/data/scaling";
import { createClient } from "@/lib/supabase/server";

// Queries Supabase for the real balance behind the Star Unlocks section --
// force dynamic so `next build` doesn't attempt to prerender this.
export const dynamic = "force-dynamic";

const STAGES = [
  { stage: 1, start: 250, alloc: 150, idle: 100, strategy: "1 Single OTM Contract (30–45 DTE, 0.35Δ)", end: 500 },
  { stage: 2, start: 500, alloc: 300, idle: 200, strategy: "1–2 Contracts (Trim cost at +100%, trail rest)", end: 1000 },
  { stage: 3, start: 1000, alloc: 600, idle: 400, strategy: "2–3 Contracts (Max 2 Tickers simultaneously)", end: 2000 },
  { stage: 4, start: 2000, alloc: 1200, idle: 800, strategy: "3–4 Volatility Breakout Contracts (Exit belly)", end: 4000 },
  { stage: 5, start: 4000, alloc: 2400, idle: 1600, strategy: "Coiled Squeeze Plays (Strict -40% hard stop)", end: 8000 },
  { stage: 6, start: 8000, alloc: 4800, idle: 3200, strategy: "Multi-week Swings (2–3 weeks to fully develop)", end: 16000 },
  { stage: 7, start: 16000, alloc: 9600, idle: 6400, strategy: "Macro Catalyst Plays (Begin 60% Bank Sweep rule)", end: 32000 },
  { stage: 8, start: 32000, alloc: 19200, idle: 12800, strategy: "High-Volume Expansion Entries (Donchian trigger)", end: 64000 },
  { stage: 9, start: 64000, alloc: 38400, idle: 25600, strategy: "Multi-lot Tiered Trimming (Preserve base capital)", end: 128000 },
  { stage: 10, start: 128000, alloc: 76800, idle: 51200, strategy: "Asymmetric Convexity Setups (High Vega/Gamma)", end: 256000 },
  { stage: 11, start: 256000, alloc: 153600, idle: 102400, strategy: "Core Swing Position Architecture (Pure Desktop)", end: 532000 },
  { stage: 12, start: 532000, alloc: 319200, idle: 212800, strategy: "Final Macro Expansion Breakout Campaign", end: 1000000 },
];

const SHEET_COLUMNS = [
  { col: "A", header: "Trade #", formula: "1, 2, 3, 4...", rule: "Sequential trade number" },
  { col: "B", header: "Ticker & Expiry", formula: "Text Input (e.g. MRNA 35DTE)", rule: "Underlying ticker, target delta & expiration date" },
  { col: "C", header: "Starting Balance", formula: "=250.00 (Initial) or =L1", rule: "Current available account cash prior to execution" },
  { col: "D", header: "Max Allocation ($)", formula: "=C2*0.60", rule: "Enforces the 40% idle buying power cash reserve rule" },
  { col: "E", header: "Entry Premium ($)", formula: "Contract fill price (e.g. 1.45)", rule: "Actual premium paid per contract share" },
  { col: "F", header: "Contract Quantity", formula: "=INT(D2/(E2*100))", rule: "Automated sizing to prevent over-leveraging" },
  { col: "G", header: "Hard Stop ($)", formula: "=E2*0.60", rule: "Strict -40% position stop loss trigger level" },
  { col: "H", header: "Trim 1 Level (+100%)", formula: "=E2*2.00", rule: "Take trade risk-free: Sell 50% lot to cover initial basis" },
  { col: "I", header: "Runner Target (+300%)", formula: "=E2*4.00", rule: "Asymmetric expansion exit level for remaining contracts" },
  { col: "J", header: "Actual Exit Premium", formula: "Average Fill Price (e.g. 4.80)", rule: "Realized blended exit price across trims & runner" },
  { col: "K", header: "Trade Net P&L ($)", formula: "=(J2-E2)*F2*100", rule: "Realized dollar profit or loss for the trade" },
  { col: "L", header: "Ending Account Balance", formula: "=C2+K2", rule: "New account balance fed directly to next stage" },
  { col: "M", header: "Bank Sweep (60% Profit)", formula: "=IF(K2>0, K2*0.60, 0)", rule: "Routes weekly realized gains to main account (WF 6333)" },
];

const EXECUTION_RULES = [
  "Opening Bell Lockout: Strictly ZERO buying of contracts between 9:30 AM – 9:40 AM EST. Let opening spread volatility settle.",
  "TTM Squeeze Filter: Confirm 20-period Bollinger Bands are contracted inside 20-period Keltner Channels (1.5 ATR).",
  "Donchian Volume Trigger: Enter on 20-period high/low breakout accompanied by volume > 1.5x 20-day SMA.",
  "Contract Selection: 30 to 45 DTE with 0.35 to 0.40 Delta. Never trade sub-7 DTE lottery options during recovery.",
  "Max Position Limits: Max 2 different tickers simultaneously to prevent cognitive dilution.",
];

function money(v: number) {
  return `$${v.toLocaleString()}`;
}

export default async function PlaybookPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: account } = user
    ? await supabase.from("accounts").select("balance").eq("user_id", user.id).maybeSingle()
    : { data: null };
  const balance = account?.balance ?? 0;

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-10">
      <SuperStar />
      <h1 className="font-mono text-xl font-bold tracking-widest text-white">
        XRILL PROGRESSIVE COMPOUND SYSTEM
      </h1>
      <p className="mt-1 text-sm text-white/50">
        Asymmetric 7.5:1 Alpha Framework • Capital Multiplication & Reset Matrix
      </p>
      <BouncingStarsToggle />

      <div id="risk-tiering" className="mt-6 scroll-mt-6">
        <Section
          title="🎯 Playbook Execution & Compounding Examples"
          subtitle="The Dynamic Risk Tiering Matrix — max risk per trade scales with the weekly pace you're actually chasing."
        >
          <ExecutionCompoundingExamples />
        </Section>
      </div>

      <div className="mt-10">
        <Section title="⭐ Star Unlocks" subtitle="Real balance milestones — no shortcuts, just growth">
          <StarUnlocks balance={balance} />
        </Section>
      </div>

      <div className="mt-4 rounded border border-primary/30 bg-primary/10 p-4">
        <div className="flex items-center gap-2">
          <Badge tone="info">ACTIVE CYCLE</Badge>
          <span className="text-sm text-white/70">$250 Reset</span>
        </div>
        <p className="mt-2 text-sm text-white/70">
          Transition from emotional/reactive trading to strategic execution. Missing a runner is
          zero-loss of conviction — it is proof the setup works. Resetting at $250 requires
          non-negotiable 60% allocation discipline, strict 40% hard stops, and mechanical trailing
          to scale systematically to $1,000,000.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Target Gain / Trade" value="+300%" tone="good" />
        <MetricCard label="Hard Stop Loss" value="-40%" tone="blocked" />
        <MetricCard label="Required Win Rate" value="30%" tone="caution" />
        <MetricCard label="Expected Value (EV)" value="+62.0%" tone="info" />
      </div>

      <Section
        title={`🚀 Compound Scaling Roadmap ($${SCALING_PRINCIPAL} → $100K in ${Math.min(
          ...WEEKLY_RATE_PLANS.map((p) => p.weeks)
        )}–${Math.max(...WEEKLY_RATE_PLANS.map((p) => p.weeks))} Weeks)`}
        subtitle="A simplified weekly-return illustration of compounding — separate from the position-sizing roadmap below, which is what the system actually enforces"
      >
        <CompoundScalingRoadmap />
      </Section>

      <Section title="Twelve-Stage Progressive Compounding Roadmap">
        {/* Mobile: every field stacked as a card, so nothing requires
            horizontal micro-scrolling on a phone. Desktop/tablet keeps
            the table -- same data, just laid out differently per
            breakpoint (sm: 640px). */}
        <div className="space-y-2 sm:hidden">
          {STAGES.map((s) => (
            <div key={s.stage} className="rounded border border-white/10 bg-surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-white/40">STAGE {s.stage}</span>
                <span className="font-mono text-xs text-accent">{money(s.start)} → {money(s.end)}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-y-1 text-xs">
                <span className="text-white/40">Trade Alloc (60%)</span>
                <span className="text-right text-white">{money(s.alloc)}</span>
                <span className="text-white/40">Cash Idle (40%)</span>
                <span className="text-right text-white">{money(s.idle)}</span>
              </div>
              <p className="mt-2 border-t border-white/10 pt-2 text-xs leading-relaxed text-white/70">
                {s.strategy}
              </p>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded border border-white/10 sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-white/50">
              <tr>
                <Th>Stage</Th>
                <Th>Start Cap</Th>
                <Th>Trade Alloc (60%)</Th>
                <Th>Cash Idle (40%)</Th>
                <Th>Position Sizing & Strategy</Th>
                <Th>End Cap</Th>
              </tr>
            </thead>
            <tbody>
              {STAGES.map((s) => (
                <tr key={s.stage} className="border-t border-white/10">
                  <Td>{s.stage}</Td>
                  <Td>{money(s.start)}</Td>
                  <Td>{money(s.alloc)}</Td>
                  <Td>{money(s.idle)}</Td>
                  <Td className="max-w-xs text-white/70">{s.strategy}</Td>
                  <Td className="font-medium text-accent">{money(s.end)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real-Time Execution Tracking Sheet Schema">
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-white/50">
              <tr>
                <Th>Col</Th>
                <Th>Column Header</Th>
                <Th>Formula (Row 2)</Th>
                <Th>Rule & Mechanics</Th>
              </tr>
            </thead>
            <tbody>
              {SHEET_COLUMNS.map((c) => (
                <tr key={c.col} className="border-t border-white/10">
                  <Td>{c.col}</Td>
                  <Td className="font-medium">{c.header}</Td>
                  <Td className="font-mono text-xs text-primary">{c.formula}</Td>
                  <Td className="text-white/70">{c.rule}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title='Non-Negotiable Operating Protocol ("The Shield")' subtitle="Structural execution rules — read right before clicking order entry.">
        <ul className="space-y-2 text-sm text-white/70">
          {EXECUTION_RULES.map((r, i) => (
            <li key={i} className="border-l-2 border-primary/40 pl-3">{r}</li>
          ))}
        </ul>
      </Section>

      <div className="mt-10 rounded-xl border-2 border-blocked/40 bg-blocked/10 p-5">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-blocked sm:text-base">
          Zero Averaging Down. Zero Revenge Trading. Accept the stop and walk away.
        </p>
        <p className="mt-3 text-center text-xs leading-relaxed text-white/60">
          All mindset rules, the two-loss morning hard-stop, and the full breakdown of the 2–5% risk-per-trade
          vs. 60/40 capital allocation vs. -40% structural stop live together on the{" "}
          <a href="/playbook/exits" className="underline hover:text-white/80">
            Exits & Psychology page
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
      {subtitle && <p className="-mt-2 mb-3 text-xs text-white/40">{subtitle}</p>}
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "blocked" | "caution" | "info";
}) {
  const toneText = { good: "text-accent", blocked: "text-blocked", caution: "text-caution", info: "text-primary" }[tone];
  return (
    <div className="rounded border border-white/10 bg-surface p-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className={`mt-1 text-lg font-bold ${toneText}`}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
