import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionOutcomeRows } from "@/lib/data/xrill-analytics-data";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";
import PulseChart from "@/components/visuals/PulseChart";
import PurpleOrbs from "@/components/visuals/PurpleOrbs";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = await getSessionOutcomeRows(user.id);

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-10">
      <PurpleOrbs className="-z-10" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-bold tracking-widest text-white">📈 XRILL ANALYTICS</h1>
          <p className="mt-1 text-sm text-white/50">Command center for your recorded sessions.</p>
        </div>
        <PulseChart className="hidden h-20 w-48 flex-none sm:block" />
      </div>
      <div className="relative">
        <AnalyticsClient rows={rows} />
      </div>
    </div>
  );
}
