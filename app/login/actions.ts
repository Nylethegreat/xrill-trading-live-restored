"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Was hardcoded to a stale preview-deployment URL -- same bug already
// fixed in app/account/actions.ts, missed here since it's a separate
// module. Now reads the same env var (and fallback) as everywhere else,
// so there's one source of truth instead of three that can drift apart.
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://xrill-trading.vercel.app";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const next = String(formData.get("next") || "/dashboard");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Supabase doesn't error on an already-registered email (so attackers
  // can't probe which emails exist) -- it returns a user with no
  // identities and sends NO email. Without this check the person sees
  // "check your email" and waits for a message that never comes.
  if (data.user && data.user.identities?.length === 0) {
    redirect(`/login?error=${encodeURIComponent("An account with this email already exists. Sign in, or use Forgot password to reset it.")}`);
  }

  redirect("/login?message=Check your email to confirm your account");
}

export async function sendPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) redirect("/login/forgot?error=Enter your email.");

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/login/forgot?error=${encodeURIComponent(error.message)}`);
  }

  // Same message whether or not the email exists, so the form can't be
  // used to check who has an account.
  redirect("/login?message=If that email has an account, a reset link is on its way.");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 6) redirect("/reset-password?error=Password must be at least 6 characters.");
  if (password !== confirm) redirect("/reset-password?error=Passwords don't match.");

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Reset link expired. Request a new one.");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
