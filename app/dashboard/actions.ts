"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDashboardTheme } from "@/lib/data/dashboardThemes";
import { isExpColor, isExpStyle, type ExpColor, type ExpStyle } from "@/lib/expBar";

export interface UpdateBalanceResult {
  success: boolean;
  error?: string;
}

// Lightweight balance-only update for the dashboard's Double-Up Ladder
// widget. Full account settings (risk %, daily loss limit) still live on
// /account — this just lets the ladder log a new balance inline without
// leaving the dashboard. Upserting only { user_id, balance, updated_at }
// leaves risk_percent/daily_loss_limit untouched on an existing row.
export async function updateBalance(balance: number): Promise<UpdateBalanceResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "You must be signed in." };
  if (!Number.isFinite(balance) || balance < 0) {
    return { success: false, error: "Enter a valid balance." };
  }

  const { error } = await supabase
    .from("accounts")
    .upsert({ user_id: user.id, balance, updated_at: new Date().toISOString() });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/account");

  return { success: true };
}

// One-click XRILL Status background picker (DashboardThemePicker) -- each
// swatch is its own tiny form posting straight here, same validate-then-
// upsert shape as saveBackgroundTheme on /account. The DB column's CHECK
// constraint is the real backstop; validating here too turns a forged
// value into a clean redirect instead of a raw constraint error.
export async function saveDashboardTheme(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const value = String(formData.get("dashboard_theme") || "");
  if (!isDashboardTheme(value)) {
    redirect("/dashboard");
  }

  await supabase.from("profiles").upsert({ user_id: user.id, dashboard_theme: value });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// EXP bar look (Classic/Segmented + one of six colors) from the Double-Up
// Ladder card. Called optimistically: the bar has already changed on
// screen, this just remembers the choice. Validated here and by the
// profiles CHECK constraints.
export async function updateExpBarLook(input: { style: ExpStyle; color: ExpColor }): Promise<UpdateBalanceResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be signed in." };
  if (!isExpStyle(input?.style) || !isExpColor(input?.color)) return { success: false, error: "Unknown bar look." };

  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, exp_bar_style: input.style, exp_bar_color: input.color });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
