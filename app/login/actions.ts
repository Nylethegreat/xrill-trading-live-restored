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
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Check your email to confirm your account");
}
