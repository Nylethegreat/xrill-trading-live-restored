"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { isBackgroundTheme } from "@/lib/data/backgroundThemes";
import { isHeaderStyle } from "@/lib/data/headerStyles";
import { computeRiskProfile, normalizeDailyLossLimit } from "@/lib/riskProfile";

// Was hardcoded to a stale preview-deployment URL
// ("xrill-trading-xrill-alert-system.vercel.app") that stopped being the
// real domain once xrill-trading.vercel.app became production -- every
// checkout success/cancel redirect and signup confirmation email link was
// silently pointing at the wrong host. Now shares the same env var (and
// fallback) as the webhook's APP_BASE_URL, so there's one source of truth
// for "what is our real URL" instead of two that can drift apart again.
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://xrill-trading.vercel.app";

// Sign-in / sign-up used by the unauthenticated split view on /account.
// These mirror app/login/actions.ts but redirect back to /account on
// both success and failure, so a bad password doesn't bounce the visitor
// off the perks showcase and onto the bare /login page.
export async function signInFromAccount(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/account");
}

export async function signUpFromAccount(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  });

  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/account?message=Check your email to confirm your account");
}

export async function saveAccountSettings(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const balance = Number(formData.get("balance"));
  const display_name = String(formData.get("display_name") || "").trim();
  const discord_user_id = String(formData.get("discord_user_id") || "").trim();

  if (!Number.isFinite(balance) || balance <= 0) {
    redirect("/account?error=Enter an account balance greater than $0.");
  }

  // Re-apply the risk hierarchy server-side (lib/riskProfile.ts) -- never
  // trust the form: risk % clamped to the Risk Tiering Matrix, the
  // structural stop kept in range, and the Daily Loss Limit bound to
  // [1.5x max trade loss, Active Sleeve] so it can't sit below one trade.
  const profile = computeRiskProfile({
    balance,
    riskPercent: Number(formData.get("risk_percent")),
    stopPercent: Number(formData.get("stop_loss_percent")),
  });
  const daily = normalizeDailyLossLimit(Number(formData.get("daily_loss_limit")), profile);

  const { error: accountError } = await supabase.from("accounts").upsert({
    user_id: user.id,
    balance,
    risk_percent: profile.riskPercent,
    stop_loss_percent: profile.stopPercent,
    daily_loss_limit: daily.value,
    updated_at: new Date().toISOString(),
  });

  if (accountError) {
    redirect(`/account?error=${encodeURIComponent(accountError.message)}`);
  }

  // Always write discord_user_id (null clears it, i.e. unlink) but only
  // overwrite display_name when the field wasn't left blank.
  const profilePayload: Record<string, unknown> = {
    user_id: user.id,
    discord_user_id: discord_user_id || null,
  };
  if (display_name) profilePayload.display_name = display_name;

  const { error: profileError } = await supabase.from("profiles").upsert(profilePayload);

  if (profileError) {
    redirect(`/account?error=${encodeURIComponent(profileError.message)}`);
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/session");
  const note =
    daily.adjusted === "raised"
      ? ` — daily loss limit raised to $${daily.value.toFixed(2)} (minimum 1.5× your $${profile.maxTradeLoss.toFixed(2)} max trade loss)`
      : daily.adjusted === "lowered"
      ? ` — daily loss limit lowered to $${daily.value.toFixed(2)} (can't exceed your Active Sleeve)`
      : "";
  redirect(`/account?message=${encodeURIComponent(`Settings saved${note}`)}`);
}

// One-click background swatch picker -- each swatch is its own tiny form
// (BackgroundThemePicker) that posts straight here. The DB column has its
// own CHECK constraint as the real backstop, but validating the value here
// too means a bad/forged value redirects with a clean error instead of
// surfacing a raw Postgres constraint violation to the user.
export async function saveBackgroundTheme(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const value = String(formData.get("background_theme") || "");
  if (!isBackgroundTheme(value)) {
    redirect("/account?error=Unknown background option.");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, background_theme: value });

  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account");
  redirect("/account");
}

// Sets the optional decorative treatment for the app's big wordmark-style
// page headers (see components/HeaderText.tsx) -- "white" is the default
// and leaves every header exactly as it always looked, the others are all
// opt-in. Same validate-then-upsert shape as saveBackgroundTheme above.
export async function saveHeaderStyle(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const value = String(formData.get("header_style") || "");
  if (!isHeaderStyle(value)) {
    redirect("/account?error=Unknown header style option.");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, header_style: value });

  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }

  // Every page that renders a HeaderText header reads header_style fresh
  // from the DB on every request, so there's no per-route cache to bust --
  // revalidating /account alone (to reflect the new active swatch here) is
  // enough.
  revalidatePath("/account");
  redirect("/account");
}

// Starts a Stripe Checkout session for the Pro tier and redirects the user
// straight into it (Stripe-hosted, not an embedded modal -- keeps card data
// entirely off this app and off this app's PCI scope). The webhook
// (app/api/webhooks/stripe/route.ts) is what actually flips profiles.tier
// to 'pro' once checkout.session.completed fires -- this action only ever
// starts the session.
export async function createProCheckoutSession() {
  return startTierCheckout("pro", process.env.STRIPE_PRO_PRICE_ID);
}

// Same flow, for the Elite tier (Pro features + real-time signals + Discord
// role sync). A separate Stripe Price, not a separate Product -- the
// webhook tells the two apart via the `tier` value stashed in session
// metadata below, not by inspecting which price was purchased.
export async function createEliteCheckoutSession() {
  return startTierCheckout("elite", process.env.STRIPE_ELITE_PRICE_ID);
}

async function startTierCheckout(tier: "pro" | "elite", priceId: string | undefined) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/account?error=Sign in to upgrade to ${tier === "pro" ? "Pro" : "Elite"}.`);

  if (!priceId) {
    redirect(`/account?error=${tier === "pro" ? "Pro" : "Elite"} checkout isn't configured yet.`);
  }

  // Reuse the Stripe customer we already have on file for this user (set by
  // the webhook after their first checkout), so a returning customer isn't
  // billed as a brand-new one every time they resubscribe.
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Stripe's SDK throws rather than returning a {data,error} tuple, so wrap
  // just the Stripe call in a plain async IIFE that returns a discriminated
  // result -- never call Next's redirect() itself from inside a try/catch,
  // since redirect() works by throwing internally and a surrounding catch
  // would swallow that throw and treat it as a Stripe failure.
  const result = await (async (): Promise<{ ok: true; url: string | null } | { ok: false; message: string }> => {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: profile?.stripe_customer_id ?? undefined,
        customer_email: profile?.stripe_customer_id ? undefined : user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${SITE_URL}/account?message=${
          tier === "pro" ? "Welcome to Pro! Your upgrade is confirmed." : "Welcome to Elite! Your upgrade is confirmed."
        }`,
        cancel_url: `${SITE_URL}/account?error=Checkout canceled.`,
        metadata: { supabase_user_id: user.id, tier },
        subscription_data: { metadata: { supabase_user_id: user.id, tier } },
      });
      return { ok: true, url: session.url };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start checkout.";
      return { ok: false, message };
    }
  })();

  if (!result.ok) redirect(`/account?error=${encodeURIComponent(result.message)}`);
  if (!result.url) redirect("/account?error=Could not start checkout.");
  redirect(result.url);
}
