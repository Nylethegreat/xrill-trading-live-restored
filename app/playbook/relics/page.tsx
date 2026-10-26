import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeaderText from "@/components/HeaderText";
import RelicCodexGrid from "@/components/playbook/RelicCodexGrid";
import FireworksCelebration from "@/components/visuals/FireworksCelebration";
import { RELICS } from "@/lib/data/relics";

// Relic Codex: a little dictionary for the twelve stage relics. Locked
// relics still show their entry (the meaning is the motivation); their art
// is a silhouette until the real balance clears that stage, with an opt-in
// preview so members can see what they're working toward.
export const dynamic = "force-dynamic";

export default async function RelicCodexPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: account } = user
    ? await supabase.from("accounts").select("balance").eq("user_id", user.id).maybeSingle()
    : { data: null };
  const balance = Number(account?.balance ?? 0);
  const unlocked = RELICS.filter((r) => balance >= r.unlockAt).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <HeaderText className="font-mono text-xl font-bold tracking-widest">📜 THE RELIC CODEX</HeaderText>
      <p className="mt-1 text-sm text-white/50">
        Twelve stages, twelve relics. Each one is a lesson the account can&apos;t buy — only earn.{" "}
        <span className="font-mono text-yellow-300/80">
          {unlocked}/{RELICS.length} unlocked
        </span>
      </p>

      <FireworksCelebration balance={balance} className="mt-4" />

      <RelicCodexGrid balance={balance} />

      <p className="mt-6 text-xs text-white/40">
        Relics unlock from your real balance on the <Link href="/playbook" className="underline hover:text-white">Roadmap</Link>. Set the stage
        you&apos;re chasing in your <Link href="/blueprint" className="underline hover:text-white">Blueprint</Link>.
      </p>
    </div>
  );
}
