import Link from "next/link";
import Logo from "@/components/Logo";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";
import { Section } from "@/components/Layout";
import { MilestoneTrackerPreview } from "@/components/MilestoneTracker";
import GatePipeline from "@/components/GatePipeline";
import PublicTradeLedger from "@/components/PublicTradeLedger";
import StageStatusBadge from "@/components/StageStatusBadge";

// PublicTradeLedger + StageStatusBadge query Supabase on every request —
// force dynamic rendering so `next build` doesn't waste time attempting
// (and timing out on) static prerendering for this route.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-60">
        <CandlestickGlow variant="hero" className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-background/10 via-background/60 to-background" />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="flex justify-center"><Logo size={56} /></div>
        <h1 className="mt-4 font-mono text-4xl font-bold tracking-widest text-white">XRILL</h1>
        <p className="mt-2 text-white/60">Trading Operating System</p>

        <div className="mt-4 flex justify-center">
          <StageStatusBadge />
        </div>

        <p className="mx-auto mt-6 max-w-lg text-white/70">
          A sequential trade-authorization engine. Every trade runs through eight
          gates — daily readiness, market conditions, setup quality, risk, and
          execution — before it's authorized.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-block rounded bg-gradient-to-r from-primary to-secondary px-5 py-2 font-medium text-white hover:opacity-90"
          >
            Get started
          </Link>
          <Link href="/about" className="text-sm text-white/60 underline hover:text-white">
            Learn how it works
          </Link>
        </div>

        <div className="mx-auto mt-10 max-w-xs text-left">
          <MilestoneTrackerPreview />
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-20">
        <Section title="🔒 The 8-Gate Trade Engine" subtitle="Click through the pipeline every trade has to clear">
          <GatePipeline />
        </Section>

        <Section title="📒 Public Trade Ledger" subtitle="Every closed alert, live from the database — no login required">
          <PublicTradeLedger />
        </Section>
      </div>
    </div>
  );
}
