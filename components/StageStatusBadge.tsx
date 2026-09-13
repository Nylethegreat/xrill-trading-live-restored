import { createClient } from "@/lib/supabase/server";
import { LiveDot } from "@/components/visuals/EkgPulse";

// Public hero pill: "CURRENT STAGE: $500 -> $1,000 (Stage 2)". Reads the
// admin-editable public_status row (see components/admin/PublicStatusForm
// on /admin/alerts) — public-read/admin-write, same pattern as trade_alerts.
//
// public_status.current_stage is a free-text label the admin sets directly
// (not computed from a balance) — id is an integer PK, singleton row id=1.
export default async function StageStatusBadge() {
  const supabase = createClient();
  const { data } = await supabase.from("public_status").select("current_stage").eq("id", 1).maybeSingle();
  const stage = data?.current_stage ?? "$500 → $1,000 (Stage 2)";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-accent">
      <LiveDot tone="accent" />
      Current Stage: {stage}
    </div>
  );
}
