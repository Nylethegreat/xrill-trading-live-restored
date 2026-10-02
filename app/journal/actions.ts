"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AFTER_FACT_REASONS } from "@/lib/afterFact";

const MAX_SCREENSHOTS_PER_SESSION = 6;

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
  mishaps?: string[]; // real-life disruptions (see lib/afterFact.ts)
  mishapNote?: string;
}

export interface SaveOutcomeResult {
  success: boolean;
  error?: string;
}

// The Codex -- a few standing prompts ("How's your day going?", etc.)
// separate from trade-session journaling. Every answer is its own row,
// grouped by entry_date on the read side (getCodexEntries in
// lib/data/xrill-analytics-data.ts) -- answering the same prompt again on
// the same day adds another entry under that date rather than overwriting
// the first one, same as the user asked for ("it just keeps going under
// there").
export interface SaveCodexEntryInput {
  prompt: string;
  answer: string;
}

export async function saveCodexEntry(input: SaveCodexEntryInput): Promise<SaveOutcomeResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const answer = input.answer.trim();
  if (!answer) return { success: false, error: "Write something first." };

  const { error } = await supabase.from("journal_codex_entries").insert({
    user_id: user.id,
    prompt: input.prompt,
    answer,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/journal");
  return { success: true };
}

export async function saveTradeOutcome(input: SaveOutcomeInput): Promise<SaveOutcomeResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { data: session, error: sessionError } = await supabase
    .from("xrill_sessions")
    .select("id, ticker, direction, trade_score, setup_score, trade_authorized, logged_after")
    .eq("id", input.sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sessionError || !session) {
    return { success: false, error: "That XRILL session could not be found." };
  }

  // Authorized trades and trades logged after the fact were really taken;
  // a blocked session never executed, so there's nothing to journal.
  if (!session.trade_authorized && !session.logged_after) {
    return { success: false, error: "That session was blocked — there's no executed trade to journal an outcome for." };
  }

  if (!Number.isFinite(input.profitLoss)) return { success: false, error: "Enter the P/L as a number." };

  // The P/L typed here is for the contracts still open. Any trims already
  // booked are added on, so the stored outcome is the WHOLE trade's P/L --
  // what Analytics, the daily loss limit and the Two-Loss Lockout read.
  const { data: trims } = await supabase
    .from("xrill_trims")
    .select("profit_loss")
    .eq("session_id", session.id)
    .eq("user_id", user.id);
  const trimPnl = (trims ?? []).reduce((sum, t) => sum + Number(t.profit_loss ?? 0), 0);
  const totalPnl = Math.round((input.profitLoss + trimPnl) * 100) / 100;

  const { error } = await supabase.from("xrill_outcomes").upsert(
    {
      user_id: user.id,
      session_id: session.id,
      ticker: session.ticker,
      direction: session.direction,
      trade_score: session.trade_score,
      setup_score: session.setup_score,
      profit_loss: totalPnl,
      followed_plan: input.followedPlan,
      followed_exit_rules: input.followedExitRules,
      emotion: input.emotion.trim() || null,
      lesson: input.lesson.trim() || null,
      exit_price: input.exitPrice ?? null,
      mishaps: (input.mishaps ?? []).filter((m) => (AFTER_FACT_REASONS as readonly string[]).includes(m)),
      mishap_note: input.mishapNote?.trim().slice(0, 300) || null,
    },
    { onConflict: "session_id" }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/journal");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");

  return { success: true };
}

// ---------------------------------------------------------------- Trims
// A trim closes PART of an open position (N of its contracts) and books
// that slice's P/L right away. The position stays open with the rest.
export interface SaveTrimInput {
  sessionId: number;
  contracts: number;
  exitPrice: number | null;
  profitLoss: number;
  note?: string;
}

export async function saveTrim(input: SaveTrimInput): Promise<SaveOutcomeResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const [{ data: session }, { data: outcome }, { data: trims }] = await Promise.all([
    supabase
      .from("xrill_sessions")
      .select("id, contracts, trade_authorized, logged_after")
      .eq("id", input.sessionId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("xrill_outcomes").select("id").eq("session_id", input.sessionId).eq("user_id", user.id).maybeSingle(),
    supabase.from("xrill_trims").select("contracts").eq("session_id", input.sessionId).eq("user_id", user.id),
  ]);

  if (!session || (!session.trade_authorized && !session.logged_after)) {
    return { success: false, error: "That position could not be found." };
  }
  if (outcome) return { success: false, error: "That trade is already closed." };

  const opened = session.contracts ?? 0;
  const trimmed = (trims ?? []).reduce((sum, t) => sum + (t.contracts ?? 0), 0);
  const remaining = opened - trimmed;
  const n = Math.floor(input.contracts);

  if (!Number.isFinite(n) || n < 1) return { success: false, error: "Trim at least 1 contract." };
  if (n >= remaining) {
    return {
      success: false,
      error:
        remaining <= 1
          ? "Only 1 contract is left — use Record Outcome to close it."
          : `You have ${remaining} contracts open. Trim up to ${remaining - 1}; closing all of them is a full close (Record Outcome).`,
    };
  }
  if (!Number.isFinite(input.profitLoss)) return { success: false, error: "Enter the trim's P/L as a number." };
  if (input.exitPrice !== null && (!Number.isFinite(input.exitPrice) || input.exitPrice < 0)) {
    return { success: false, error: "Exit premium can't be negative." };
  }

  const { error } = await supabase.from("xrill_trims").insert({
    user_id: user.id,
    session_id: session.id,
    contracts: n,
    exit_price: input.exitPrice,
    profit_loss: Math.round(input.profitLoss * 100) / 100,
    note: input.note?.trim() || null,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTrim(trimId: number): Promise<SaveOutcomeResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { data: trim } = await supabase.from("xrill_trims").select("id, session_id").eq("id", trimId).eq("user_id", user.id).maybeSingle();
  if (!trim) return { success: false, error: "Trim not found." };
  const { data: outcome } = await supabase.from("xrill_outcomes").select("id").eq("session_id", trim.session_id).maybeSingle();
  if (outcome) return { success: false, error: "That trade is closed; its trims are locked into the final P/L." };

  const { error } = await supabase.from("xrill_trims").delete().eq("id", trimId).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return { success: true };
}

// ----------------------------------------------------------- Screenshots
// The image itself is uploaded straight from the browser to the private
// "trade-screenshots" bucket (Storage RLS only allows <user_id>/... paths);
// this links the uploaded file to a session.
export async function addScreenshot(input: { sessionId: number; path: string; caption?: string }): Promise<SaveOutcomeResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  if (!input.path.startsWith(`${user.id}/`)) return { success: false, error: "Invalid upload path." };

  const { data: session } = await supabase.from("xrill_sessions").select("id").eq("id", input.sessionId).eq("user_id", user.id).maybeSingle();
  if (!session) {
    await supabase.storage.from("trade-screenshots").remove([input.path]);
    return { success: false, error: "That session could not be found." };
  }

  const { count } = await supabase
    .from("xrill_screenshots")
    .select("id", { count: "exact", head: true })
    .eq("session_id", input.sessionId)
    .eq("user_id", user.id);
  if ((count ?? 0) >= MAX_SCREENSHOTS_PER_SESSION) {
    await supabase.storage.from("trade-screenshots").remove([input.path]);
    return { success: false, error: `Up to ${MAX_SCREENSHOTS_PER_SESSION} screenshots per trade.` };
  }

  const { error } = await supabase.from("xrill_screenshots").insert({
    user_id: user.id,
    session_id: input.sessionId,
    path: input.path,
    caption: input.caption?.trim().slice(0, 140) || null,
  });
  if (error) {
    await supabase.storage.from("trade-screenshots").remove([input.path]);
    return { success: false, error: error.message };
  }

  revalidatePath("/journal");
  return { success: true };
}

export async function deleteScreenshot(screenshotId: number): Promise<SaveOutcomeResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { data: shot } = await supabase.from("xrill_screenshots").select("id, path").eq("id", screenshotId).eq("user_id", user.id).maybeSingle();
  if (!shot) return { success: false, error: "Screenshot not found." };

  await supabase.storage.from("trade-screenshots").remove([shot.path]);
  const { error } = await supabase.from("xrill_screenshots").delete().eq("id", screenshotId).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/journal");
  return { success: true };
}
