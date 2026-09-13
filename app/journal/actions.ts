"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Ported from the original CLI's xrill_trade_outcome() (menu #22, main.py).
// That function was the ONLY way `xrill_outcomes` ever got written to in the
// Python system, and it never made it into the Streamlit UI or the first
// pass of this port — meaning /analytics has been reading a table nothing
// could write to. This is that missing write path.

export interface SaveOutcomeInput {
  sessionId: number;
  profitLoss: number;
  followedPlan: boolean;
  followedExitRules: boolean;
  emotion: string;
  lesson: string;
  exitPrice?: number | null;
}

export interface SaveOutcomeResult {
  success: boolean;
  error?: string;
}

export async function saveTradeOutcome(input: SaveOutcomeInput): Promise<SaveOutcomeResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { data: session, error: sessionError } = await supabase
    .from("xrill_sessions")
    .select("id, ticker, direction, trade_score, setup_score, trade_authorized")
    .eq("id", input.sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sessionError || !session) {
    return { success: false, error: "That XRILL session could not be found." };
  }

  if (!session.trade_authorized) {
    return { success: false, error: "That session was blocked — there's no executed trade to journal an outcome for." };
  }

  const { error } = await supabase.from("xrill_outcomes").upsert(
    {
      user_id: user.id,
      session_id: session.id,
      ticker: session.ticker,
      direction: session.direction,
      trade_score: session.trade_score,
      setup_score: session.setup_score,
      profit_loss: input.profitLoss,
      followed_plan: input.followedPlan,
      followed_exit_rules: input.followedExitRules,
      emotion: input.emotion.trim() || null,
      lesson: input.lesson.trim() || null,
      exit_price: input.exitPrice ?? null,
    },
    { onConflict: "session_id" }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/journal");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");

  return { success: true };
}
