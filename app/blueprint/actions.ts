"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LIMITS, normalizeBlueprint, type Blueprint } from "@/lib/blueprint";

type Result = { success: boolean; error?: string };
const MAX_BYTES = 60_000;

async function signedIn() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function clean(input: unknown): Blueprint | null {
  const bp = normalizeBlueprint(input);
  return JSON.stringify(bp).length > MAX_BYTES ? null : bp;
}

export async function saveBlueprint(input: unknown): Promise<Result> {
  const { supabase, user } = await signedIn();
  if (!user) return { success: false, error: "Not signed in." };
  const data = clean(input);
  if (!data) return { success: false, error: "Blueprint is too large — trim a few entries." };
  const { error } = await supabase
    .from("blueprints")
    .upsert({ user_id: user.id, data, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return { success: false, error: error.message };
  revalidatePath("/blueprint");
  return { success: true };
}

// A savepoint stores the blueprint as it is right now (and saves it as the
// current blueprint too), so the member can always load back to that moment.
export async function createSavepoint(label: string, input: unknown): Promise<Result> {
  const { supabase, user } = await signedIn();
  if (!user) return { success: false, error: "Not signed in." };
  const data = clean(input);
  if (!data) return { success: false, error: "Blueprint is too large — trim a few entries." };
  const { count } = await supabase.from("blueprint_savepoints").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= LIMITS.savepoints) return { success: false, error: `You can keep ${LIMITS.savepoints} savepoints — delete an old one first.` };
  const saved = await saveBlueprint(data);
  if (!saved.success) return saved;
  const name = label.trim().slice(0, LIMITS.label) || `Savepoint ${new Date().toLocaleDateString("en-US")}`;
  const { error } = await supabase.from("blueprint_savepoints").insert({ user_id: user.id, label: name, data });
  if (error) return { success: false, error: error.message };
  revalidatePath("/blueprint");
  return { success: true };
}

export async function loadSavepoint(id: number): Promise<{ success: boolean; error?: string; data?: Blueprint }> {
  const { supabase, user } = await signedIn();
  if (!user) return { success: false, error: "Not signed in." };
  const { data: row, error } = await supabase.from("blueprint_savepoints").select("data").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error || !row) return { success: false, error: error?.message ?? "Savepoint not found." };
  const data = normalizeBlueprint(row.data);
  const saved = await saveBlueprint(data);
  if (!saved.success) return saved;
  return { success: true, data };
}

export async function deleteSavepoint(id: number): Promise<Result> {
  const { supabase, user } = await signedIn();
  if (!user) return { success: false, error: "Not signed in." };
  const { error } = await supabase.from("blueprint_savepoints").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/blueprint");
  return { success: true };
}
