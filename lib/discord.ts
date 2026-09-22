// Elite-tier Discord role sync + auto-join. Three pieces:
//   1. OAuth (identify + guilds.join scope) so a member proves which
//      Discord account is theirs AND grants us permission to add them to
//      the server directly -- /api/discord/connect starts it,
//      /api/discord/callback finishes it and stores discord_user_id.
//   2. addGuildMember: uses the member's own OAuth access token (from
//      step 1) plus the bot token to add them to the XRILL server in one
//      call, with the Elite role attached if they're a brand-new member.
//      Requires the bot to have "Create Invite" permission in the guild.
//   3. setEliteDiscordRole: the bot token's REST API, used to grant (or
//      revoke) the Elite role directly -- this is the fallback for
//      members who already joined the server manually before linking,
//      since addGuildMember's role assignment only applies when it
//      actually adds someone new (Discord ignores it for existing
//      members). The member never sees or touches the bot token.
//
// All five env vars below are required for this to do anything; every
// function here fails soft (returns false / throws a caught error) rather
// than breaking checkout or account settings when Discord isn't configured
// yet -- see the try/catch around setEliteDiscordRole's call sites.

const DISCORD_API = "https://discord.com/api/v10";

export function discordConfigured(): boolean {
  return Boolean(
    process.env.DISCORD_CLIENT_ID &&
      process.env.DISCORD_CLIENT_SECRET &&
      process.env.DISCORD_BOT_TOKEN &&
      process.env.DISCORD_GUILD_ID &&
      process.env.DISCORD_ELITE_ROLE_ID
  );
}

// Where Discord redirects back to after the member approves the OAuth
// prompt. Must exactly match a redirect URI registered on the Discord
// application, including trailing slashes (Discord is strict about this).
export function discordRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://xrill-trading.vercel.app";
  return `${base}/api/discord/callback`;
}

// Builds the URL that starts the OAuth prompt. `state` round-trips through
// Discord unmodified -- we use it to carry the signed-in user's id so the
// callback knows whose profile to update without trusting anything else
// in the request. guilds.join is what lets addGuildMember below add the
// member to the server directly instead of requiring them to click an
// invite link themselves.
export function discordAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID ?? "",
    redirect_uri: discordRedirectUri(),
    response_type: "code",
    scope: "identify guilds.join",
    state,
    prompt: "consent",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

// Exchanges the OAuth `code` for an access token, then calls /users/@me
// with it to get the member's Discord user id + username. Returns null on
// any failure (expired code, revoked app, etc.) rather than throwing, since
// the callback route treats "couldn't link" as a normal, recoverable case.
// The access token is included so the callback can pass it to
// addGuildMember -- it's short-lived and never stored.
export async function exchangeDiscordCode(
  code: string
): Promise<{ id: string; username: string; accessToken: string } | null> {
  try {
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID ?? "",
        client_secret: process.env.DISCORD_CLIENT_SECRET ?? "",
        grant_type: "authorization_code",
        code,
        redirect_uri: discordRedirectUri(),
      }),
    });
    if (!tokenRes.ok) return null;
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) return null;
    const user = (await userRes.json()) as { id: string; username: string };
    return { id: user.id, username: user.username, accessToken: access_token };
  } catch {
    return null;
  }
}

// Adds the member directly to the XRILL Discord server using their own
// OAuth access token (obtained with the guilds.join scope) plus the bot
// token -- no invite link required. If `roleId` is given, it's attached
// at the moment of joining. Returns one of:
//   "joined"   -- brand-new member, added (and role-assigned, if given)
//   "existing" -- already a member (Discord returns 204; it does NOT
//                 retroactively apply `roles` for existing members, so
//                 the caller should still call setEliteDiscordRole)
//   "failed"   -- missing config, no permission (bot needs "Create
//                 Invite" in the guild), or any other error
export async function addGuildMember(
  accessToken: string,
  discordUserId: string,
  roleId?: string
): Promise<"joined" | "existing" | "failed"> {
  if (!discordConfigured()) return "failed";
  const guildId = process.env.DISCORD_GUILD_ID;

  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${discordUserId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: accessToken, roles: roleId ? [roleId] : undefined }),
    });
    if (res.status === 201) return "joined";
    if (res.status === 204) return "existing";
    return "failed";
  } catch {
    return "failed";
  }
}

// Grants (or revokes) the Elite role for a Discord user id, using the bot
// token -- requires the bot to already be a member of the guild with
// "Manage Roles" and to sit above the Elite role in the role list.
// Returns false (never throws) so callers can log-and-continue rather than
// fail the whole request over a Discord hiccup.
export async function setEliteDiscordRole(discordUserId: string, grant: boolean): Promise<boolean> {
  if (!discordConfigured()) return false;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_ELITE_ROLE_ID;

  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
      method: grant ? "PUT" : "DELETE",
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    });
    // Discord returns 204 on success either way. A 404 here usually means
    // the member hasn't joined the Discord server yet -- not configuration
    // that this call can fix, so just report it and move on.
    return res.ok;
  } catch {
    return false;
  }
}
