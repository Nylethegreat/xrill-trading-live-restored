import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, EMAIL_FROM } from "@/lib/resend";
import { welcomeProEmailHtml } from "@/lib/emails/welcomePro";
import { setEliteDiscordRole } from "@/lib/discord";

// Used to build absolute links inside the welcome email (a mail client has
// no concept of a relative "/dashboard"). Set this in Vercel env vars to
// the real production origin, e.g. https://xrill-trading.vercel.app
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://xrill-trading.vercel.app";

// Needs the raw request body for signature verification and the Node
// crypto APIs Stripe's webhook verifier relies on -- keep this on the
// Node runtime, not Edge.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe signature or webhook secret." }, { status: 400 });
  }

  // Signature verification needs the exact raw bytes Stripe signed --
  // request.text() (not .json()) so nothing reserializes the body first.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  try {
    switch (event.type) {
      // A checkout completed -- the subscription is active. Promote the
      // account to pro or elite (whichever this session was for) and
      // record the Stripe ids for later (cancellation, customer-portal
      // links, support lookups).
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          console.error("checkout.session.completed with no supabase_user_id metadata:", session.id);
          break;
        }

        // Which tier this checkout was for. Sessions created before the
        // Elite tier existed have no `tier` metadata at all -- default
        // those to "pro" (the only paid tier at the time) rather than
        // rejecting the event.
        const tier: "pro" | "elite" = session.metadata?.tier === "elite" ? "elite" : "pro";

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq("user_id", userId);

        if (error) {
          console.error(`Failed to upgrade profile to ${tier}:`, error.message);
          break;
        }

        // Best-effort: a failed email should never fail the webhook, since
        // the actual tier upgrade above already succeeded and Stripe would
        // otherwise retry a payment event that already landed.
        const recipientEmail = session.customer_details?.email ?? session.customer_email ?? null;
        if (recipientEmail) {
          try {
            await getResend().emails.send({
              from: EMAIL_FROM,
              to: recipientEmail,
              subject:
                tier === "elite"
                  ? "Welcome to XRILL ELITE 🚀 — Signals + Discord are live"
                  : "Welcome to XRILL PRO 🚀 — Let's get to work",
              html: welcomeProEmailHtml(APP_BASE_URL),
            });
          } catch (emailErr) {
            console.error("Failed to send welcome-to-PRO email:", emailErr);
          }
        } else {
          console.error("checkout.session.completed with no recipient email on session:", session.id);
        }
        break;
      }

      // The subscription ended (canceled, payment failures exhausted,
      // etc.) -- downgrade back to free. Prefer the subscription's own
      // metadata (set at checkout time); fall back to matching on the
      // stored subscription id for older subscriptions created before
      // metadata was attached.
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        // Fetch first (not after) -- once the downgrade below runs there's
        // no way to tell this member used to be Elite, and no discord_user_id
        // to revoke the role from.
        const lookup = userId
          ? await supabaseAdmin.from("profiles").select("tier, discord_user_id").eq("user_id", userId).maybeSingle()
          : await supabaseAdmin
              .from("profiles")
              .select("tier, discord_user_id")
              .eq("stripe_subscription_id", subscription.id)
              .maybeSingle();
        const wasElite = lookup.data?.tier === "elite";
        const discordUserId = lookup.data?.discord_user_id ?? null;

        const downgrade = supabaseAdmin
          .from("profiles")
          .update({ tier: "free", stripe_subscription_id: null });

        const { error } = userId
          ? await downgrade.eq("user_id", userId)
          : await downgrade.eq("stripe_subscription_id", subscription.id);

        if (wasElite && discordUserId) {
          // Best-effort: never let a Discord API hiccup block the actual
          // subscription downgrade above, which has already run by this point.
          await setEliteDiscordRole(discordUserId, false).catch(() => {});
        }

        if (error) console.error("Failed to downgrade profile to free:", error.message);
        break;
      }

      default:
        // Not a type we act on -- acknowledge so Stripe doesn't retry it.
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
