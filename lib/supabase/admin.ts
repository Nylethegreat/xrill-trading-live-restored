import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://bwcxahaboouxxvjgjyou.supabase.co";

// SERVER-ONLY. Bypasses RLS via the service_role key -- never import this
// from a client component, never prefix the key with NEXT_PUBLIC_, and
// never send it to the browser. This exists for exactly one caller today:
// app/api/webhooks/stripe/route.ts, where there's no user session/cookie to
// authenticate as the user, so it's the only legitimate way to write
// profiles.tier / stripe_customer_id / stripe_subscription_id after a
// payment event (the private.prevent_privilege_escalation trigger on
// profiles specifically trusts the service_role and only the service_role
// for those columns -- see the security_hardening_view_invoker_and_
// profile_insert_guard / add_stripe_columns_and_guard_them migrations).
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (see .env.local.example) -- required for the Stripe webhook to update profiles.tier."
    );
  }

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
