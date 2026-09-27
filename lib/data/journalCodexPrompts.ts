// The standing Codex prompts -- split into their own client-safe module
// (no Supabase import) so importing them from "use client" components like
// CodexClient doesn't drag lib/supabase/server.ts (which needs
// next/headers, server-only) into the client bundle.
export const CODEX_PROMPTS = [
  "How's your day going?",
  "What's actually on your mind right now?",
  "One thing that went right today?",
  "One good memory -- a specific detail from a day you liked?",
] as const;
