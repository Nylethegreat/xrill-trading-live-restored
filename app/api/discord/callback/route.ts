import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeDiscordCode, setEliteDiscordRole } from "@/lib/discord";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // the Supabase user id, set by /api/discord/connect

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Require both an active session AND that it matches who started the
  // flow -- protects against a stale/replayed callback link being used to
  // link Discord to whoever happens to be signed in when it's opened.
  if (!user || !code || !state || user.id !== state) {
    return NextResponse.redirect(`${origin}/account?error=Discord link failed or expired. Try again.`);
  }

  const discordUser = await exchangeDiscordCode(code);
  if (!discordUser) {
    return NextResponse.redirect(`${origin}/account?error=Couldn't verify your Discord account. Try again.`);
  }

  const { data: profile } = await supabase.from("profiles").select("tier").eq("user_id", user.id).maybeSingle();

  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, discord_user_id: discordUser.id });

  if (error) {
    return NextResponse.redirect(`${origin}/account?error=${encodeURIComponent(error.message)}`);
  }

  // Only Elite members actually get the role granted. Linking Discord as a
  // Free/Pro member still saves discord_user_id (useful once they upgrade
  // later) but doesn't touch server roles.
  if (profile?.tier === "elite") {
    const granted = await setEliteDiscordRole(discordUser.id, true);
    if (!granted) {
      return NextResponse.redirect(
        `${origin}/account?message=Discord linked as @${discordUser.username}, but the Elite role couldn't be granted automatically -- make sure you've joined the XRILL Discord server first, then try Connect Discord again.`
      );
    }
  }

  return NextResponse.redirect(`${origin}/account?message=Discord linked as @${discordUser.username}.`);
}
