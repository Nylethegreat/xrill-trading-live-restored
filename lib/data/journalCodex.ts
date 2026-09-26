import { createClient } from "@/lib/supabase/server";

export interface CodexEntry {
  id: string;
  entry_date: string; // YYYY-MM-DD
  prompt: string;
  answer: string;
  created_at: string;
}

export interface CodexDay {
  date: string;
  entries: CodexEntry[];
}

// The standing Codex prompts live in their own client-safe module (see
// lib/data/journalCodexPrompts.ts) so "use client" components can import
// them without dragging this file's server-only Supabase import along.
// Re-exported here too so server code can keep importing everything from
// one place.
export { CODEX_PROMPTS } from "@/lib/data/journalCodexPrompts";

// Every answer is its own row (see saveCodexEntry) -- this groups them by
// entry_date, newest date first, newest entry within a date first, which
// is what "it just keeps going under there" means for a day you answer
// more than once.
export async function getCodexDays(userId: string): Promise<CodexDay[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("journal_codex_entries")
    .select("id, entry_date, prompt, answer, created_at")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];

  const byDate = new Map<string, CodexEntry[]>();
  for (const row of data as CodexEntry[]) {
    const bucket = byDate.get(row.entry_date);
    if (bucket) bucket.push(row);
    else byDate.set(row.entry_date, [row]);
  }

  return Array.from(byDate.entries()).map(([date, entries]) => ({ date, entries }));
}
