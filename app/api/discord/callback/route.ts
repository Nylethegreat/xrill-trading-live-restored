import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeDiscordCode, addGuildMember, setEliteDiscordRole } from "@/lib/discord";

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

  // Only Elite members get auto-joined to the Discord server and get the
  // role. Linking Discord as a Free/Pro member still saves
  // discord_user_id (useful once they upgrade later) but doesn't touch
  // the server at all.
  if (profile?.tier === "elite") {
    const eliteRoleId = process.env.DISCORD_ELITE_ROLE_ID;
    const joinResult = await addGuildMember(discordUser.accessToken, discordUser.id, eliteRoleId);

    // addGuildMember attaches the role only when actually adding someone
    // new -- Discord ignores the `roles` field for a PUT against an
    // existing member. So whenever they weren't brand-new (or the join
    // call itself failed for some other reason), fall back to granting
    // the role directly.
    const roleGranted = joinResult === "joined" ? true : await setEliteDiscordRole(discordUser.id, true);

    if (joinResult === "failed" && !roleGranted) {
      return NextResponse.redirect(
        `${origin}/account?message=Discord linked as @${discordUser.username}, but couldn't add you to the server automatically -- join the XRILL Discord via invite link, then try Connect Discord again.`
      );
    }

    const welcomeNote = joinResult === "joined" ? " You've been added to the server automatically." : "";
    return NextResponse.redirect(`${origin}/account?message=Discord linked as @${discordUser.username}.${welcomeNote}`);
  }

  return NextResponse.redirect(`${origin}/account?message=Discord linked as @${discordUser.username}.`);
}
