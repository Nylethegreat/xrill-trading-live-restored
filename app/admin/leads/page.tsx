import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/Badge";

// Queries Supabase (via cookies()) on every request -- force dynamic so
// `next build` doesn't attempt to prerender this.
export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/leads");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: leads } = await supabase
    .from("leads")
    .select("id, source, keyword, handle, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-mono text-xl font-bold tracking-widest text-white">📥 LEADS</h1>
      <p className="mt-1 text-sm text-white/50">
        Everyone who triggered a keyword automation (ManyChat, etc.) and landed here — newest first, last 200.
      </p>

      <div className="mt-6 space-y-2">
        {(leads ?? []).length === 0 ? (
          <p className="rounded border border-white/10 bg-surface p-4 text-sm text-white/40">
            No leads yet — once someone comments your trigger keyword and ManyChat fires the webhook, they'll show
            up here.
          </p>
        ) : (
          leads!.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/10 bg-surface p-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  {lead.handle ? `@${lead.handle}` : lead.full_name ?? "Unknown"}
                </span>
                {lead.handle && lead.full_name && (
                  <span className="text-xs text-white/40">{lead.full_name}</span>
                )}
                {lead.keyword && <Badge tone="neutral">{lead.keyword}</Badge>}
                <Badge tone="info">{lead.source}</Badge>
              </div>
              <div className="text-xs text-white/50">
                {new Date(lead.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
