"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
