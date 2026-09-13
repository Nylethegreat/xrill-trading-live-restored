import { createClient } from "@/lib/supabase/server";
import XrillWizard from "@/components/XrillWizard";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

export default async function SessionPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: account } = await supabase
    .from("accounts")
    .select("balance, risk_percent")
    .eq("user_id", user!.id)
    .maybeSingle();

  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;

  return <XrillWizard accountBalance={balance} riskPercent={riskPercent} />;
}
