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

export default function TermsPage() {
  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-40 opacity-40">
        <CandlestickGlow variant="banner" className="h-full w-full" />
      </div>
      <h1 className="relative font-mono text-xl font-bold tracking-widest text-white">TERMS OF SERVICE</h1>
      <p className="relative mt-1 text-sm text-white/50">Last updated — placeholder, set this when you publish.</p>

      <p className="mt-6 rounded border border-caution/30 bg-caution/10 p-3 text-xs text-white/70">
        This page is a structural placeholder, not finished legal copy — every bracketed field needs to be filled in
        and the whole thing reviewed by a lawyer before you rely on it. See also the{" "}
        <Link href="/disclaimer" className="underline">
          Disclaimer
        </Link>{" "}
        page for the trading-specific risk language.
      </p>

      <Section title="1. Acceptance of Terms">
        <p>
          By creating an account or otherwise using XRILL Trading Operating System (the "Service"), operated by
          [Your Legal Business Name] ("XRILL," "we," "us"), you agree to these Terms of Service. If you do not
          agree, do not use the Service.
        </p>
      </Section>

      <Section title="2. The Service">
        <p>
          XRILL provides trade-planning, journaling, scoring, and discipline tools, and may publish educational
          trade alerts to subscribers. The Service is for educational purposes only — see the{" "}
          <Link href="/disclaimer" className="underline">Disclaimer</Link> for what that does and doesn't mean.
        </p>
      </Section>

      <Section title="3. Accounts &amp; Eligibility">
        <p>
          You must be at least [18] years old and capable of forming a binding contract to use the Service. You are
          responsible for maintaining the confidentiality of your account credentials and for all activity under
          your account.
        </p>
      </Section>

      <Section title="4. Subscriptions &amp; Billing">
        <p>
          [Describe your tiers, pricing, billing cycle, auto-renewal, and cancellation policy here — e.g. "Paid
          tiers renew automatically each month until canceled. You may cancel at any time from Account Settings;
          cancellation takes effect at the end of the current billing period. Refunds are handled as described at
          [refund policy link / terms]."]
        </p>
      </Section>

      <Section title="5. Acceptable Use">
        <p>You agree not to:</p>
        <p>
          Redistribute, resell, or publicly repost trade alerts or paid content outside the Service; attempt to
          access another user's account or data; use the Service to provide investment advice to third parties;
          reverse-engineer, scrape, or interfere with the Service's operation; or use the Service for any unlawful
          purpose.
        </p>
      </Section>

      <Section title="6. No Investment Advice">
        <p>
          Nothing in the Service constitutes investment, legal, or tax advice. See the full{" "}
          <Link href="/disclaimer" className="underline">Disclaimer</Link> — it's incorporated into these Terms by
          reference.
        </p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, XRILL and its owners, employees, and affiliates are not liable for
          any trading losses, lost profits, or indirect, incidental, or consequential damages arising from your use
          of the Service, whether or not you were advised of the possibility of such damages. The Service is
          provided "as is" without warranties of any kind.
        </p>
      </Section>

      <Section title="8. Termination">
        <p>
          We may suspend or terminate your access to the Service at any time for violation of these Terms. You may
          stop using the Service and close your account at any time.
        </p>
      </Section>

      <Section title="9. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Continued use of the Service after a change constitutes
          acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="10. Governing Law">
        <p>These Terms are governed by the laws of the State of [your state], without regard to conflict-of-law principles.</p>
      </Section>

      <Section title="11. Contact">
        <p>Questions about these Terms? Contact [your contact email].</p>
      </Section>
    </div>
  );
}
