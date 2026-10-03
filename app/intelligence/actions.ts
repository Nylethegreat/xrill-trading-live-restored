"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CheckInPhase = "before" | "after";

export interface SaveCheckInInput {
  sessionId: number;
  phase: CheckInPhase;
  confidence: number;
  discipline: number;
  emotionalControl: number;
  patience: number;
  note?: string;
}

const inRange = (n: number) => Number.isInteger(n) && n >= 1 && n <= 10;

// One check-in per position per phase: re-running the same phase
// overwrites it (upsert on session_id + phase), so a student who
// re-rates themselves just updates their snapshot instead of piling up rows.
export async function savePositionCheckIn(input: SaveCheckInInput): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in." };

  if (input.phase !== "before" && input.phase !== "after") return { success: false, error: "Invalid phase." };
  if (![input.confidence, input.discipline, input.emotionalControl, input.patience].every(inRange)) {
    return { success: false, error: "Each rating must be 1–10." };
  }

  // RLS also enforces this, but checking here gives a clean error message.
  const { data: session } = await supabase
    .from("xrill_sessions")
    .select("id")
    .eq("id", input.sessionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!session) return { success: false, error: "That position wasn't found on your account." };

  const { error } = await supabase.from("position_checkins").upsert(
    {
      user_id: user.id,
      session_id: input.sessionId,
      phase: input.phase,
      confidence: input.confidence,
      discipline: input.discipline,
      emotional_control: input.emotionalControl,
      patience: input.patience,
      note: input.note?.trim() ? input.note.trim().slice(0, 500) : null,
      created_at: new Date().toISOString(),
    },
    { onConflict: "session_id,phase" }
  );
  if (error) return { success: false, error: error.message };

  revalidatePath("/intelligence");
  return { success: true };
}
