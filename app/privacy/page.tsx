import Link from "next/link";
import CandlestickGlow from "@/components/visuals/CandlestickGlow";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-white/70">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-40 opacity-40">
        <CandlestickGlow variant="banner" className="h-full w-full" />
      </div>
      <h1 className="relative font-mono text-xl font-bold tracking-widest text-white">PRIVACY POLICY</h1>
      <p className="relative mt-1 text-sm text-white/50">Last updated — placeholder, set this when you publish.</p>

      <p className="mt-6 rounded border border-caution/30 bg-caution/10 p-3 text-xs text-white/70">
        This page is a structural placeholder, not finished legal copy — every bracketed field needs to be filled in
        and the whole thing reviewed by a lawyer before you rely on it. The data flows described below are accurate
        to how the Service is actually built as of this writing; if that changes, this page needs to change with it.
        See also{" "}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>{" "}
        and the{" "}
        <Link href="/disclaimer" className="underline">
          Disclaimer
        </Link>
        .
      </p>

      <Section title="1. What We Collect">
        <p>
          <span className="font-medium text-white">Account data:</span> your email address and password, handled by
          our authentication provider (Supabase Auth) — we never see or store your raw password.
        </p>
        <p>
          <span className="font-medium text-white">Trading data you enter:</span> your account balance, risk-per-trade
          setting, daily loss limit, and every XRILL session (daily check-in answers, trade plan, risk math, execution
          check, journal outcome/P&amp;L/lesson) you run through the site. This is the core of the product — it's how
          the journal, analytics, and Star Unlocks work — and it's visible only to you (and to admins, for support
          purposes) via row-level security on our database.
        </p>
        <p>
          <span className="font-medium text-white">Payment data:</span> if you upgrade to Pro or Elite, checkout is
          handled entirely by Stripe. We never see or store your card number — we only receive your subscription
          status and tier from Stripe's webhook.
        </p>
        <p>
          <span className="font-medium text-white">Discord data:</span> if you connect Discord (Elite tier), we
          request the <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">identify</code> and{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">guilds.join</code> OAuth scopes — just
          enough to confirm who you are on Discord and add you to our server with the correct role. We don't request
          access to your messages, other servers, or friends list.
        </p>
        <p>
          <span className="font-medium text-white">Technical data:</span> standard things any web host collects —
          IP address, browser type, and request logs — via our hosting provider (Vercel) and database provider
          (Supabase), for security and abuse prevention.
        </p>
      </Section>

      <Section title="2. Who We Share It With">
        <p>
          We don't sell your data. It's shared only with the service providers that make the Service work, each
          only for the purpose described:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li><span className="text-white">Supabase</span> — database and authentication.</li>
          <li><span className="text-white">Vercel</span> — hosting.</li>
          <li><span className="text-white">Stripe</span> — payment processing for Pro/Elite subscriptions.</li>
          <li><span className="text-white">Resend</span> — transactional email (welcome emails, receipts).</li>
          <li><span className="text-white">Discord</span> — server membership and role sync for Elite members who opt in.</li>
        </ul>
        <p>Each of those providers has its own privacy policy governing how they handle data on our behalf.</p>
      </Section>

      <Section title="3. Cookies &amp; Local Storage">
        <p>
          We use Supabase's authentication cookies to keep you signed in — that's it. We don't run third-party
          advertising or tracking pixels.
        </p>
      </Section>

      <Section title="4. Data Retention &amp; Deletion">
        <p>
          We keep your account and session data for as long as your account is active. If you want your account and
          associated data deleted, email us at{" "}
          <span className="font-mono text-white">[privacy@yourdomain.com]</span> and we'll process the request within
          [X] days, subject to what we're legally required to retain (e.g. Stripe transaction records).
        </p>
      </Section>

      <Section title="5. Children's Privacy">
        <p>The Service is not directed to anyone under 18, and we don't knowingly collect data from minors.</p>
      </Section>

      <Section title="6. Changes to This Policy">
        <p>
          If this policy changes in a material way, we'll update the date at the top of this page and, for
          significant changes, notify active users by email.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Questions about this policy or your data — email{" "}
          <span className="font-mono text-white">[privacy@yourdomain.com]</span>.
        </p>
      </Section>

      <p className="mt-10 text-xs text-white/30">
        [Placeholder legal text — have this reviewed by an attorney before relying on it, especially the data
        retention and deletion timelines.]
      </p>
    </div>
  );
}
