import { Resend } from "resend";

let cached: Resend | null = null;

// Lazily constructed so importing this module never throws at build time
// (e.g. during `next build` before RESEND_API_KEY is configured) -- the
// error only surfaces when the webhook actually tries to send an email.
export function getResend(): Resend {
  if (!cached) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to .env.local (see .env.local.example) before sending emails."
      );
    }
    cached = new Resend(apiKey);
  }
  return cached;
}

// Centralized so every transactional email comes from the same address and
// that address only has to be changed in one place. Must be a verified
// sender/domain in the Resend dashboard, or sends will fail.
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? "XRILL Team <noreply@xrill-trading.vercel.app>";
