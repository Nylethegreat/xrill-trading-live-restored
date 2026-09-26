import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Receives ManyChat's "External Request" action when someone comments a
// trigger keyword (SYSTEM / CHALLENGE) on an Instagram/TikTok post and the
// automation fires. Configure the External Request in ManyChat as:
//
//   Method: POST
//   URL:    https://xrill-trading.vercel.app/api/leads/manychat
//   Headers: x-manychat-secret: <MANYCHAT_WEBHOOK_SECRET, same value as in Vercel>
//   Body (JSON):
//     {
//       "handle": "{{ig_username}}",
//       "full_name": "{{full_name}}",
//       "keyword": "SYSTEM"
//     }
//
// (Field names in {{double braces}} are ManyChat's own dynamic fields --
// pick whatever's available for the channel you're automating; Instagram
// exposes ig_username, full_name, etc. under "User Data" in the request
// builder.)
//
// No RLS policy lets anon/authenticated touch the leads table (see the
// create_leads_table_for_manychat_webhook migration) -- this route is the
// only writer, using the service-role admin client, gated by a shared
// secret header instead of a user session since ManyChat has neither.
//
// Needs the Node runtime for the admin client / crypto.timingSafeEqual.
export const runtime = "nodejs";

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch rather than returning false,
  // and requires equal-length buffers -- short-circuit that case first
  // without leaking timing info that's actually useful to an attacker
  // (a length check is not a meaningful side channel here).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expectedSecret = process.env.MANYCHAT_WEBHOOK_SECRET;
  if (!expectedSecret) {
    console.error("MANYCHAT_WEBHOOK_SECRET is not set -- rejecting all ManyChat webhook requests.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const providedSecret = request.headers.get("x-manychat-secret");
  if (!secretMatches(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: "Invalid or missing signature." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { handle, full_name, keyword } = body as Record<string, unknown>;

  const cleanHandle = typeof handle === "string" ? handle.slice(0, 200) : null;
  const cleanFullName = typeof full_name === "string" ? full_name.slice(0, 200) : null;
  const cleanKeyword = typeof keyword === "string" ? keyword.slice(0, 100) : null;

  if (!cleanHandle && !cleanFullName) {
    return NextResponse.json({ error: "Need at least a handle or full_name to save a lead." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("leads").insert({
    source: "manychat",
    handle: cleanHandle,
    full_name: cleanFullName,
    keyword: cleanKeyword,
    raw: body,
  });

  if (error) {
    console.error("Failed to insert ManyChat lead:", error.message);
    return NextResponse.json({ error: "Failed to save lead." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
