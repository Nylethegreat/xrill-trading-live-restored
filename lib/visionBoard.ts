import type { SupabaseClient } from "@supabase/supabase-js";
import type { VisionItem } from "@/components/playbook/VisionBoard";

// Shared by /playbook and /blueprint: this user's vision board rows with
// short-lived (1h) signed URLs from the private "vision-board" bucket.
export async function getVisionItems(supabase: SupabaseClient, userId: string | null): Promise<VisionItem[]> {
  if (!userId) return [];
  const { data: rows } = await supabase
    .from("vision_board_items")
    .select("id, path, caption")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (!rows || rows.length === 0) return [];
  const { data: signed } = await supabase.storage.from("vision-board").createSignedUrls(
    rows.map((r) => r.path),
    60 * 60
  );
  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({ id: r.id, caption: r.caption, url: urlByPath.get(r.path) ?? null }));
}
