"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const SITE_URL = "https://xrill-trading-xrill-alert-system.vercel.app";

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
  const risk_percent = Number(formData.get("risk_percent"));
  const daily_loss_limit = Number(formData.get("daily_loss_limit"));
  const display_name = String(formData.get("display_name") || "").trim();
  const discord_user_id = String(formData.get("discord_user_id") || "").trim();

  const { error: accountError } = await supabase
    .from("accounts")
    .upsert({ user_id: user.id, balance, risk_percent, daily_loss_limit, updated_at: new Date().toISOString() });

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
  redirect("/account?message=Settings saved");
}

// Starts a Stripe Checkout session for the Pro tier and redirects the user
// straight into it (Stripe-hosted, not an embedded modal -- keeps card data
// entirely off this app and off this app's PCI scope). The webhook
// (app/api/webhooks/stripe/route.ts) is what actually flips profiles.tier
// to 'pro' once checkout.session.completed fires -- this action only ever
// starts the session.
export async function createProCheckoutSession() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account?error=Sign in to upgrade to Pro.");

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    redirect("/account?error=Pro checkout isn't configured yet.");
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
        success_url: `${SITE_URL}/account?message=Welcome to Pro! Your upgrade is confirmed.`,
        cancel_url: `${SITE_URL}/account?error=Checkout canceled.`,
        metadata: { supabase_user_id: user.id },
        subscription_data: { metadata: { supabase_user_id: user.id } },
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
