import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { saveAccountSettings, signInFromAccount, signUpFromAccount, createProCheckoutSession, createEliteCheckoutSession } from "./actions";
import RealtimeAlertsFeed from "@/components/RealtimeAlertsFeed";
import LightningBolt from "@/components/visuals/LightningBolt";

// Queries Supabase (via cookies()) on every request - force dynamic
// rendering so `next build` doesn't waste time attempting (and timing
// out on) static prerendering for this route.
export const dynamic = "force-dynamic";

function PerkRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent/15 text-accent">
        ✓
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/50">{description}</p>
      </div>
    </div>
  );
}

function MemberPerksCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-surface via-surface to-accent/5 p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
      <p className="relative font-mono text-[11px] font-semibold uppercase tracking-widest text-accent">
        Member Access
      </p>
      <h2 className="relative mt-1 text-lg font-bold text-white">
        What you unlock with an XRILL account
      </h2>
      <div className="relative mt-5 space-y-4">
        <PerkRow
          title="Real-Time Alert Engine"
          description="Every trade setup we publish hits your dashboard and Discord the moment it's live — entry, stop, target, and running updates until it's closed."
        />
        <PerkRow
          title="Double-Up Ladder"
          description="Track your account toward the next milestone with a visual progress ladder, from your first $250 checkpoint on up."
        />
        <PerkRow
          title="Discord Sync"
          description="Link your Discord ID once and every alert, trim, and close ping you directly — no missed moves."
        />
      </div>
      <p className="relative mt-6 rounded border border-caution/30 bg-caution/10 p-2.5 text-[11px] leading-relaxed text-white/50">
        Educational content only — not personalized investment advice. See the{" "}
        <Link href="/disclaimer" className="underline hover:text-white">
          Disclaimer
        </Link>{" "}
        for the full CFTC Rule 4.41 hypothetical performance disclosure.
      </p>
    </div>
  );
}

function AuthPanel({ error, message }: { error?: string; message?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-6">
      <h1 className="text-2xl font-semibold text-white">Log in or sign up</h1>
      <p className="mt-1 text-sm text-white/50">Access your dashboard, alerts, and account settings.</p>

      {message && (
        <p className="mt-4 rounded bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>
      )}
      {error && <p className="mt-4 rounded bg-blocked/10 px-3 py-2 text-sm text-blocked">{error}</p>}

      <form className="mt-6 space-y-3">
        <div>
          <label className="block text-sm text-white/70">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            formAction={signInFromAccount}
            className="flex-1 rounded bg-accent px-3 py-2 text-sm font-medium text-black hover:opacity-90"
          >
            Sign in
          </button>
          <button
            formAction={signUpFromAccount}
            className="flex-1 rounded border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          <AuthPanel error={searchParams.error} message={searchParams.message} />
          <MemberPerksCard />
        </div>
      </div>
    );
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("balance, risk_percent, daily_loss_limit")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, discord_user_id, tier")
    .eq("user_id", user.id)
    .maybeSingle();

  const tier = profile?.tier ?? "free";
  const balance = account?.balance ?? 50000;
  const riskPercent = account?.risk_percent ?? 1;
  const dailyLossLimit = account?.daily_loss_limit ?? 1000;
  const maxRisk = balance * (riskPercent / 100);

  return (
    <div className="relative mx-auto max-w-md overflow-hidden px-4 py-12">
      <LightningBolt className="right-[-40px] top-0 h-[420px] w-[180px] opacity-40" />
      <h1 className="relative text-2xl font-semibold">Account Settings</h1>

      {searchParams.message && (
        <p className="mt-4 rounded bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {searchParams.message}
        </p>
      )}
      {searchParams.error && (
        <p className="mt-4 rounded bg-blocked/10 px-3 py-2 text-sm text-blocked">
          {searchParams.error}
        </p>
      )}

      <div className="mt-8 rounded border border-white/10 bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Plan</h2>
            <p className="mt-1 flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                  tier === "free"
                    ? "border-white/20 bg-white/10 text-white/60"
                    : tier === "elite"
                    ? "border-secondary/40 bg-secondary/15 text-secondary"
                    : "border-accent/40 bg-accent/15 text-accent"
                }`}
              >
                {tier}
              </span>
            </p>
          </div>
          {tier === "free" && (
            <div className="flex gap-2">
              <form action={createProCheckoutSession}>
                <button className="rounded bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                  Upgrade to Pro
                </button>
              </form>
              <form action={createEliteCheckoutSession}>
                <button className="rounded border border-secondary/50 px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/10">
                  Go Elite
                </button>
              </form>
            </div>
          )}
          {tier === "pro" && (
            <form action={createEliteCheckoutSession}>
              <button className="rounded border border-secondary/50 px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/10">
                Upgrade to Elite
              </button>
            </form>
          )}
        </div>
        {tier === "free" && (
          <p className="mt-2 text-xs text-white/40">
            Pro unlocks persistent trade history, automated pre-trade checklist scoring, and analytics. Elite adds
            the real-time signals feed and automatic Discord role sync on top. Checkout is hosted by Stripe — your
            card details never touch this site.
          </p>
        )}
        {tier === "pro" && (
          <p className="mt-2 text-xs text-white/40">
            Elite adds the real-time signals feed and automatic Discord role sync on top of everything Pro already
            gives you.
          </p>
        )}
        {tier === "elite" && (
          <div className="mt-3">
            <a
              href="/api/discord/connect"
              className="inline-block rounded bg-[#5865F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Connect Discord
            </a>
            <p className="mt-2 text-xs text-white/40">
              Links your Discord account and grants the Elite role automatically. Join the XRILL Discord server first
              if you haven't already.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Live Alerts</h2>
        <div className="mt-3">
          {tier === "elite" ? (
            <RealtimeAlertsFeed variant="feed" />
          ) : (
            <div className="rounded border border-white/10 bg-surface p-4 text-sm text-white/50">
              <p>
                The real-time signals feed is an Elite perk.{" "}
                {tier === "pro" ? (
                  <>Your Pro plan already includes the full Journal and Analytics — track your own trades there.</>
                ) : (
                  <>Free and Pro members can still run the 8-Gate Wizard manually for every trade.</>
                )}
              </p>
              <form action={createEliteCheckoutSession} className="mt-3">
                <button className="rounded border border-secondary/50 px-3 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/10">
                  Unlock with Elite
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <form action={saveAccountSettings} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-white/70">Display name (shown on leaderboard)</label>
          <input
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            placeholder="e.g. TraderX"
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            Discord ID or username
            {profile?.discord_user_id && (
              <span className="rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                LINKED
              </span>
            )}
          </label>
          <input
            name="discord_user_id"
            defaultValue={profile?.discord_user_id ?? ""}
            placeholder="e.g. traderx or your numeric User ID"
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
          <p className="mt-1 text-xs text-white/40">
            Links your account to Discord so future alert pings can reach you directly. Enable Developer Mode in
            Discord (Settings → Advanced), then right-click your profile and "Copy User ID" — or just enter your
            username. Leave blank and save to unlink.
          </p>
        </div>
        <div>
          <label className="block text-sm text-white/70">Account balance ($)</label>
          <input
            name="balance"
            type="number"
            step="0.01"
            defaultValue={balance}
            required
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70">Risk per trade (%)</label>
          <input
            name="risk_percent"
            type="number"
            step="0.01"
            defaultValue={riskPercent}
            required
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70">Daily loss limit ($)</label>
          <input
            name="daily_loss_limit"
            type="number"
            step="0.01"
            defaultValue={dailyLossLimit}
            required
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>

        <p className="text-sm text-white/50">
          Maximum trade risk at current settings: <span className="text-white">${maxRisk.toLocaleString()}</span>
        </p>

        <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90">
          Save settings
        </button>
      </form>
    </div>
  );
}
