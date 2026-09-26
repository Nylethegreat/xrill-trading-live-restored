import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminAlertForm from "@/components/admin/AdminAlertForm";
import ActivePositions from "@/components/admin/ActivePositions";
import PublicStatusForm from "@/components/admin/PublicStatusForm";
import Badge from "@/components/Badge";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

export default async function AdminAlertsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/alerts");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [{ data: activeAlerts }, { data: closedAlerts }, { data: publicStatus }] = await Promise.all([
    supabase
      .from("trade_alerts")
      .select("id, created_at, ticker, direction, entry_price, stop_loss, target_price, notes, status")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("trade_alerts")
      .select("id, created_at, closed_at, ticker, direction, entry_price, stop_loss, target_price, exit_price, return_pct, gates_passed, status")
      .eq("status", "closed")
      .order("closed_at", { ascending: false })
      .limit(10),
    supabase.from("public_status").select("current_stage").eq("id", 1).maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-mono text-xl font-bold tracking-widest text-white">🛰️ ADMIN SIGNAL DISPATCHER</h1>
      <p className="mt-1 text-sm text-white/50">
        Publish a trade setup — it broadcasts live to every member on the site and to Discord.
      </p>
      <p className="mt-1 text-xs text-white/40">
        <Link href="/admin/leads" className="underline hover:text-white/70">
          View captured leads →
        </Link>
      </p>

      <div className="mt-4 rounded border border-caution/30 bg-caution/10 p-3 text-xs leading-relaxed text-white/70">
        <strong className="text-caution">Compliance reminder:</strong> every alert published here is educational
        content, not personalized investment advice, and hypothetical/past performance never guarantees future
        results (CFTC Rule 4.41). Full text on the{" "}
        <Link href="/disclaimer" className="underline hover:text-white">
          Disclaimer page
        </Link>
        .
      </div>

      <div className="mt-6">
        <AdminAlertForm />
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Public Stage Status</h2>
        <p className="mt-0.5 text-xs text-white/40">
          Drives the "CURRENT STAGE" pill on the homepage hero — a marketing figure, not any real member's balance.
        </p>
        <div className="mt-3">
          <PublicStatusForm initialStage={publicStatus?.current_stage ?? "$500 → $1,000 (Stage 2)"} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Active Positions {activeAlerts && activeAlerts.length > 0 ? `(${activeAlerts.length})` : ""}
        </h2>
        <p className="mt-0.5 text-xs text-white/40">
          Push a running update, or close the position out — both broadcast to Discord.
        </p>
        <div className="mt-3">
          <ActivePositions alerts={activeAlerts ?? []} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Recently Closed</h2>
        <div className="mt-3 space-y-2">
          {(closedAlerts ?? []).length === 0 ? (
            <p className="text-sm text-white/40">No closed positions yet.</p>
          ) : (
            closedAlerts!.map((a) => {
              const isLong = a.direction === "long";
              let isWin: boolean | null = null;
              if (a.exit_price !== null) {
                isWin = isLong ? a.exit_price >= a.entry_price : a.exit_price <= a.entry_price;
              } else if (a.return_pct !== null) {
                isWin = a.return_pct >= 0;
              }

              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/10 bg-surface p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{a.ticker}</span>
                    <Badge tone={isLong ? "good" : "loss"}>{a.direction.toUpperCase()}</Badge>
                    {isWin !== null && <Badge tone={isWin ? "good" : "loss"}>{isWin ? "WIN" : "LOSS"}</Badge>}
                    {a.gates_passed !== null && <Badge tone="neutral">{a.gates_passed}/8 gates</Badge>}
                  </div>
                  <div className="text-xs text-white/50">
                    Entry ${a.entry_price}
                    {a.exit_price !== null && ` · Exit $${a.exit_price}`}
                    {a.return_pct !== null && ` · ${a.return_pct > 0 ? "+" : ""}${a.return_pct}%`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
