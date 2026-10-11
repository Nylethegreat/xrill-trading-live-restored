import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderText from "@/components/HeaderText";
import SectorLinks from "@/components/SectorLinks";
import BlueprintEditor, { type SavepointRow } from "@/components/blueprint/BlueprintEditor";
import VisionBoard from "@/components/playbook/VisionBoard";
import QuestMapTexture from "@/components/visuals/textures/QuestMapTexture";
import FireworksCelebration from "@/components/visuals/FireworksCelebration";
import { DEFAULT_BLUEPRINT, normalizeBlueprint } from "@/lib/blueprint";
import { getVisionItems } from "@/lib/visionBoard";

// The member's Blueprint: north star, goals, roadmap, trade checklists and
// rules in one place, beside their vision board, with savepoints they can
// load back to. Reads the user's own rows only (RLS + .eq on user_id).
export const dynamic = "force-dynamic";

export default async function BlueprintPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: row }, { data: sps }, { data: account }, visionItems] = await Promise.all([
    supabase.from("blueprints").select("data").eq("user_id", user.id).maybeSingle(),
    supabase.from("blueprint_savepoints").select("id, label, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("accounts").select("balance").eq("user_id", user.id).maybeSingle(),
    getVisionItems(supabase, user.id),
  ]);
  const blueprint = row ? normalizeBlueprint(row.data) : DEFAULT_BLUEPRINT;
  const balance = Number(account?.balance ?? 0);

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20">
        <QuestMapTexture idPrefix="quest-blueprint" className="opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/75" />
      </div>
      <HeaderText className="font-mono text-xl font-bold tracking-widest">🧭 MY BLUEPRINT</HeaderText>
      <p className="mt-1 text-sm text-white/50">
        Your plan, your path, your rules, and the pictures that remind you why. Save often; savepoints let you load back to any moment.
      </p>
      <FireworksCelebration balance={balance} className="mt-4" />
      <div className="mt-6">
        <BlueprintEditor initial={blueprint} savepoints={(sps ?? []) as SavepointRow[]} balance={balance} />
      </div>
      <div className="mt-8 rounded-xl border border-white/10 bg-black/45 p-4 backdrop-blur-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">🌠 Vision board</h2>
        <p className="mb-3 mt-0.5 text-xs text-white/40">Private to you. The same board as your Playbook.</p>
        <VisionBoard items={visionItems} userId={user.id} />
      </div>
      <SectorLinks current="blueprint" className="mt-8" />
    </div>
  );
}
