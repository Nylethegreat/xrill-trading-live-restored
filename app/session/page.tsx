import SectorLinks from "@/components/SectorLinks";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDailyLossStatus } from "@/lib/data/dailyLossLock";
import { getTwoLossStatus } from "@/lib/data/twoLossLock";
import EngineSelector from "@/components/session/EngineSelector";
import AfterFactLog from "@/components/session/AfterFactLog";
import { getOpenPositionsStatus } from "@/lib/data/openPositions";
import { getTradeCapStatus } from "@/lib/data/tradeCap";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

function LockedOut({ reason }: { reason: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-4xl">🔒</p>
      <h1 className="mt-4 font-mono text-xl font-bold tracking-widest text-loss">TERMINAL LOCKED</h1>
      <p className="mt-3 text-sm text-white/60">{reason}</p>
      <p className="mt-4 text-xs text-white/40">
        This is the rule doing its job, not a bug. Walking away here is the whole point of setting the limit in the
        first place.
      </p>
      <div className="mt-6 flex flex-col items-center gap-2">
        <Link href="/journal#codex" className="text-sm text-primary underline hover:text-primary/80">
          Put it into words in the Journal Codex →
        </Link>
        <Link href="/session?mode=after" className="text-sm text-loss underline hover:text-loss/80">
          🚨 Already took a trade? Log it after the fact
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
  searchParams: { engine?: string; mode?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: account }, dailyLoss, twoLoss, openPositions, tradeCap] = await Promise.all([
    supabase.from("accounts").select("balance, risk_percent, stop_loss_percent").eq("user_id", user!.id).maybeSingle(),
    getDailyLossStatus(user!.id),
    getTwoLossStatus(user!.id),
    getOpenPositionsStatus(user!.id),
    getTradeCapStatus(user!.id),
  ]);

  // Emergency "logged after" path comes before the locks on purpose: the
  // trade already exists, and getting it on record beats hiding it.
  if (searchParams.mode === "after") {
    return (
      <AfterFactLog
        accountBalance={account?.balance ?? 50000}
        riskPercent={account?.risk_percent ?? 1}
        stopPercent={account?.stop_loss_percent ?? undefined}
      />
    );
  }

  if (dailyLoss.locked) {
    return (
      <LockedOut
        reason={
          <>
            Today's journaled net P/L is{" "}
            <span className="font-mono text-loss">-${Math.abs(dailyLoss.netPnl).toLocaleString()}</span> against a
            daily loss limit of <span className="font-mono text-white">${dailyLoss.limit.toLocaleString()}</span>.
            No new session can be started for the rest of today — it resets at midnight Eastern.
          </>
        }
      />
    );
  }

  if (twoLoss.locked) {
    return (
      <LockedOut
        reason={
          <>
            <span className="font-mono text-loss">{twoLoss.stopOutCount}</span> stop-outs journaled today — the
            Two-Loss Lockout. No new session can be started for the rest of today — it resets at midnight Eastern.
          </>
        }
      />
    );
  }

  if (tradeCap.locked) {
    return (
      <LockedOut
        reason={
          <>
            <span className="font-mono text-loss">
              {tradeCap.taken} of {tradeCap.cap}
            </span>{" "}
            trades taken today — the Daily Trade Cap.
            {tradeCap.skippedEngine > 0 && (
              <>
                {" "}
                {tradeCap.skippedEngine} of them skipped the engine.
              </>
            )}{" "}
            No new session can be started for the rest of today — it resets at midnight Eastern. The best trade left
            today is the one you don&apos;t take.
          </>
        }
      />
    );
  }

  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;

  const initialEngine = searchParams.engine === "daytrade" ? "daytrade" : searchParams.engine === "swing" ? "swing" : undefined;

  return (
    <>
      <TradeCapBanner taken={tradeCap.taken} cap={tradeCap.cap} skipped={tradeCap.skippedEngine} />
      <EngineSelector
        accountBalance={balance}
        riskPercent={riskPercent}
        stopPercent={account?.stop_loss_percent ?? undefined}
        initialEngine={initialEngine}
        openCount={openPositions.count}
        openLimit={openPositions.limit}
        recommendedOpen={openPositions.recommended}
        zeroDteTaken={tradeCap.zeroDteAuthorized}
      />
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <SectorLinks current="session" />
      </div>
    </>
  );
}

// One line above the engine picker so the count is in your face before
// you start, not only when you hit the wall.
function TradeCapBanner({ taken, cap, skipped }: { taken: number; cap: number; skipped: number }) {
  const left = cap - taken;
  const last = left === 1;
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <div
        className={`rounded border px-3 py-2 text-center text-xs ${
          last ? "border-caution/40 bg-caution/10 text-caution" : "border-white/10 bg-white/5 text-white/60"
        }`}
      >
        🎟️ Trade {taken + 1} of {cap} today
        {last ? " — your last one. Make it an A+ or don't take it." : ` · ${left} left`}
        {skipped > 0 && <span className="text-loss"> · {skipped} skipped the engine today</span>}
      </div>
    </div>
  );
}
