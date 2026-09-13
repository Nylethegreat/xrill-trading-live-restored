import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://bwcxahaboouxxvjgjyou.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Y3hhaGFib291eHh2amdqeW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzcxNjMsImV4cCI6MjEwNDQxMzE2M30.h1RoyEqUU8W9Gcpg6jx1or1Onyt_W2LgSSH2YsUSNV0";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
