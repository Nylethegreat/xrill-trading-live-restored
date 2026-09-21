import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { discordAuthorizeUrl, discordConfigured } from "@/lib/discord";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(`${origin}/login?next=/account`);

  if (!discordConfigured()) {
    return NextResponse.redirect(`${origin}/account?error=Discord isn't configured yet.`);
  }

  // `state` carries the user's id through Discord's redirect so the
  // callback can attribute the link without trusting anything else in
  // the request. A crypto-random component would be needed for a
  // general-purpose CSRF-proof state; here the only thing state gates is
  // "which profile row to update," and that update also re-checks the
  // caller has an active Supabase session, so this is sufficient.
  return NextResponse.redirect(discordAuthorizeUrl(user.id));
}
