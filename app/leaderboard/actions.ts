"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Join or leave the Weekly Discipline Board (and its Discord shout-outs).
export async function setLeaderboardOptIn(on: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { error } = await supabase.from("profiles").upsert({ user_id: user.id, show_on_leaderboard: on });
  if (error) return { success: false, error: error.message };

  revalidatePath("/leaderboard");
  return { success: true };
}
