import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PassportClient, { type PassportEntry } from "@/components/passport/PassportClient";

// Private page: only the admin account can open it, and RLS on
// passport_entries limits every row to its owner (user_id = auth.uid()).
export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/passport");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data } = await supabase
    .from("passport_entries")
    .select("id, kind, title, entry_date, details, done, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Private · FIU junior year · 2026–27</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Junior Year Passport</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">
        Log every event you go to, keep a list of experiences to chase, and remember the people you meet. Only you can
        see this page.
      </p>
      <PassportClient userId={user.id} initial={(data ?? []) as PassportEntry[]} />
    </div>
  );
}
