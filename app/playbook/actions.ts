"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Personal vision board. Images go straight from the browser into the
// private "vision-board" bucket under <user_id>/... (Storage RLS enforces
// the folder); these actions link, caption and remove them.
const MAX_VISION_ITEMS = 24; // keep in sync with components/playbook/VisionBoard.tsx (a "use server" file may only export async functions)
const BUCKET = "vision-board";

type Result = { success: boolean; error?: string };

export async function addVisionItem(input: { path: string; caption?: string }): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };
  if (!input.path.startsWith(`${user.id}/`)) return { success: false, error: "Invalid upload path." };

  const { count } = await supabase.from("vision_board_items").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= MAX_VISION_ITEMS) {
    await supabase.storage.from(BUCKET).remove([input.path]);
    return { success: false, error: `Your board holds up to ${MAX_VISION_ITEMS} pictures — remove one first.` };
  }

  const { error } = await supabase.from("vision_board_items").insert({
    user_id: user.id,
    path: input.path,
    caption: input.caption?.trim().slice(0, 80) || null,
  });
  if (error) {
    await supabase.storage.from(BUCKET).remove([input.path]);
    return { success: false, error: error.message };
  }
  revalidatePath("/playbook");
  return { success: true };
}

export async function updateVisionCaption(id: number, caption: string): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };
  const { error } = await supabase
    .from("vision_board_items")
    .update({ caption: caption.trim().slice(0, 80) || null })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/playbook");
  return { success: true };
}

export async function deleteVisionItem(id: number): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };
  const { data: item } = await supabase.from("vision_board_items").select("id, path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!item) return { success: false, error: "Picture not found." };
  await supabase.storage.from(BUCKET).remove([item.path]);
  const { error } = await supabase.from("vision_board_items").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/playbook");
  return { success: true };
}
