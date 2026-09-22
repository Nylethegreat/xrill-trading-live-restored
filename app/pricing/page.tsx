import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProCheckoutSession, createEliteCheckoutSession } from "@/app/account/actions";

export const dynamic = "force-dynamic"; // reads the signed-in user's tier on every request

interface TierCopy {
  id: "free" | "pro" | "elite";
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlight?: string; // e.g. "Most Popular"
}

const TIERS: TierCopy[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    tagline: "The full 8-Gate Wizard, run manually.",
    features: [
      "Full 8-Gate trade-authorization framework",
      "Manual checklist inputs for every gate",
      "Glossary, Strategy Library, and Playbook access",
      "No persistent trade history — session resets on close",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29.99",
    tagline: "Personal accountability — your discipline, tracked.",
    highlight: "Most Popular",
    features: [
      "Everything in Free",
      "Persistent cloud trade history & journal",
      "Automated pre-trade checklist scoring",
      "Full Analytics — win rate, gate failure patterns, and more",
      "Custom gate rules",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: "$49.99",
    tagline: "Pro, plus the real-time signals feed and Discord.",
    features: [
      "Everything in Pro",
      "Real-time signals feed",
      "Live trade alerts as they're dispatched",
      "Automatic Discord role sync — private channels unlocked",
    ],
  },
];

export default async function PricingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: "free" | "pro" | "elite" = "free";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("tier").eq("user_id", user.id).maybeSingle();
    tier = (profile?.tier as typeof tier) ?? "free";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Pick your plan</h1>
        <p className="mt-2 text-white/60">
          Every tier runs the same 8-Gate trade-authorization engine. Pro and Elite add what happens around it.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {TIERS.map((t) => {
          const isCurrent = tier === t.id;
          return (
            <div
              key={t.id}
              className={`relative flex flex-col rounded-lg border p-6 ${
                t.id === "elite"
                  ? "border-secondary/50 bg-secondary/5"
                  : t.id === "pro"
                  ? "border-accent/50 bg-accent/5"
                  : "border-white/10 bg-surface"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-black">
                  {t.highlight}
                </span>
              )}
              <h2 className="text-lg font-semibold text-white">{t.name}</h2>
              <p className="mt-1 text-2xl font-bold text-white">
                {t.price}
                {t.id !== "free" && <span className="text-sm font-normal text-white/50">/mo</span>}
              </p>
              <p className="mt-2 text-sm text-white/60">{t.tagline}</p>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-white/70">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <PricingCta tierId={t.id} isSignedIn={Boolean(user)} isCurrent={isCurrent} viewerTier={tier} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-white/40">
        Checkout is hosted by Stripe — your card details never touch this site. Cancel anytime from Account
        Settings.
      </p>
    </div>
  );
}

function PricingCta({
  tierId,
  isSignedIn,
  isCurrent,
  viewerTier,
}: {
  tierId: "free" | "pro" | "elite";
  isSignedIn: boolean;
  isCurrent: boolean;
  viewerTier: "free" | "pro" | "elite";
}) {
  const rank = { free: 0, pro: 1, elite: 2 };

  if (isCurrent) {
    return (
      <span className="block rounded border border-white/20 px-4 py-2 text-center text-sm font-medium text-white/50">
        Current Plan
      </span>
    );
  }

  if (tierId === "free") {
    // Nobody "buys" Free — either they're not signed in yet, or they're
    // already on a paid tier and Free isn't a downgrade path from here.
    return isSignedIn ? null : (
      <Link
        href="/login?next=/dashboard"
        className="block rounded bg-white/10 px-4 py-2 text-center text-sm font-medium text-white hover:bg-white/20"
      >
        Get Started Free
      </Link>
    );
  }

  // Paid tier, but the viewer already has something equal or better —
  // nothing to click (Elite viewing the Pro card, for instance).
  if (isSignedIn && rank[viewerTier] > rank[tierId]) {
    return <span className="block text-center text-xs text-white/30">Included in your plan</span>;
  }

  if (!isSignedIn) {
    return (
      <Link
        href="/login?next=/pricing"
        className={`block rounded px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 ${
          tierId === "elite" ? "border border-secondary/50 text-secondary hover:bg-secondary/10" : "bg-accent text-black"
        }`}
      >
        Sign in to upgrade
      </Link>
    );
  }

  const action = tierId === "elite" ? createEliteCheckoutSession : createProCheckoutSession;
  return (
    <form action={action}>
      <button
        className={`w-full rounded px-4 py-2 text-sm font-medium hover:opacity-90 ${
          tierId === "elite" ? "border border-secondary/50 text-secondary hover:bg-secondary/10" : "bg-accent text-black"
        }`}
      >
        {tierId === "elite" && viewerTier === "pro" ? "Upgrade to Elite" : `Get ${tierId === "elite" ? "Elite" : "Pro"}`}
      </button>
    </form>
  );
}
