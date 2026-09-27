import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDailyLossStatus } from "@/lib/data/dailyLossLock";
import EngineSelector from "@/components/session/EngineSelector";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

function LockedOut({ netPnl, limit }: { netPnl: number; limit: number }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-4xl">🔒</p>
      <h1 className="mt-4 font-mono text-xl font-bold tracking-widest text-loss">TERMINAL LOCKED</h1>
      <p className="mt-3 text-sm text-white/60">
        Today's journaled net P/L is{" "}
        <span className="font-mono text-loss">-${Math.abs(netPnl).toLocaleString()}</span> against a daily loss
        limit of <span className="font-mono text-white">${limit.toLocaleString()}</span>. No new session can be
        started for the rest of today — it resets at midnight Eastern.
      </p>
      <p className="mt-4 text-xs text-white/40">
        This is the rule doing its job, not a bug. Walking away here is the whole point of setting the limit in the
        first place.
      </p>
      <div className="mt-6 flex flex-col items-center gap-2">
        <Link href="/journal#codex" className="text-sm text-primary underline hover:text-primary/80">
          Put it into words in the Journal Codex →
        </Link>
        <Link href="/dashboard" className="text-sm text-white/50 underline hover:text-white/70">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default async function SessionPage({
  searchParams,
}: {
  searchParams: { engine?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: account }, dailyLoss] = await Promise.all([
    supabase.from("accounts").select("balance, risk_percent").eq("user_id", user!.id).maybeSingle(),
    getDailyLossStatus(user!.id),
  ]);

  if (dailyLoss.locked) {
    return <LockedOut netPnl={dailyLoss.netPnl} limit={dailyLoss.limit} />;
  }

  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;

  const initialEngine = searchParams.engine === "daytrade" ? "daytrade" : searchParams.engine === "swing" ? "swing" : undefined;

  return <EngineSelector accountBalance={balance} riskPercent={riskPercent} initialEngine={initialEngine} />;
}
