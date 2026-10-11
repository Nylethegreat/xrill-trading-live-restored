import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeaderText from "@/components/HeaderText";
import RelicIcon from "@/components/visuals/RelicIcon";
import FireworksCelebration from "@/components/visuals/FireworksCelebration";
import { RELICS, RELIC_CODEX } from "@/lib/data/relics";

// Relic Codex: a little dictionary for the twelve stage relics. Locked
// relics still show their entry (the meaning is the motivation), but their
// art stays a silhouette until the real balance clears that stage.
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {RELICS.map((r) => {
          const got = balance >= r.unlockAt;
          const c = RELIC_CODEX[r.id];
          return (
            <article
              key={r.id}
              id={r.id}
              className="relative rounded-xl border bg-black/50 p-5 backdrop-blur-sm"
              style={{ borderColor: got ? `${r.color}66` : "rgba(255,255,255,0.1)", boxShadow: got ? `0 0 24px ${r.color}22` : undefined }}
            >
              <div className="flex items-start gap-4">
                <RelicIcon id={r.id} unlocked={got} size={52} glow={r.color} />
                <div className="min-w-0">
                  <div className="font-mono text-[11px] tracking-widest text-white/40">
                    STAGE {r.stage} · {r.realm === "all" ? "ALL REALMS" : r.realm.toUpperCase()} · ${r.unlockAt.toLocaleString()}
                  </div>
                  <h2 className="mt-0.5 text-lg font-semibold text-white">{r.name}</h2>
                  <div className="text-xs italic" style={{ color: r.color }}>
                    {c.kind}
                  </div>
                </div>
                {got && (
                  <span className="ml-auto rounded-full border border-yellow-300/40 px-2 py-0.5 font-mono text-[10px] text-yellow-200">
                    UNLOCKED
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{c.essence}</p>
              <p className="mt-3 border-t border-white/10 pt-3 text-sm text-white/90">
                <span className="mr-2 font-mono text-[10px] tracking-widest text-white/40">VOW</span>“{c.vow}”
              </p>
              <p className="mt-2 text-xs text-white/40">{r.lore}</p>
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-white/40">
        Relics unlock from your real balance on the <Link href="/playbook" className="underline hover:text-white">Roadmap</Link>. Set the stage
        you&apos;re chasing in your <Link href="/blueprint" className="underline hover:text-white">Blueprint</Link>.
      </p>
    </div>
  );
}
