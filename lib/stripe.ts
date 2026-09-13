import Stripe from "stripe";

let cached: Stripe | null = null;

// Lazily constructed so importing this module never throws at build time
// (e.g. during `next build` before STRIPE_SECRET_KEY is configured) --
// the error only surfaces when a server action or the webhook route
// actually tries to talk to Stripe.
export function getStripe(): Stripe {
  if (!cached) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local (see .env.local.example) before using Stripe checkout or the webhook."
      );
    }
    // No explicit apiVersion: the installed stripe package (currently
    // ^22.6.2 per package.json) pins its own default API version internally,
    // and the SDK's TypeScript types require this literal to match that
    // pinned value exactly -- omitting it avoids a hardcoded string here
    // silently drifting out of sync on the next `npm update stripe`.
    cached = new Stripe(secretKey, {
      typescript: true,
    });
  }
  return cached;
}
