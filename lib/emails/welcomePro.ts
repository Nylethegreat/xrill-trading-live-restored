// Plain-string HTML template (no React Email dependency added) so this
// stays a drop-in match for the existing lib/stripe.ts / lib/resend.ts
// "no extra framework" style. baseUrl should be the real production
// origin (e.g. https://xrill-trading.vercel.app) so links work from
// inside an email client, which has no concept of a relative "/dashboard".
export function welcomeProEmailHtml(baseUrl: string): string {
  const dashboardUrl = `${baseUrl}/dashboard`;
  const playbookUrl = `${baseUrl}/playbook`;
  const accountUrl = `${baseUrl}/account`;

  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #e5e5e5; background:#0b0b0d; padding: 32px 28px; border-radius: 12px;">
    <h1 style="font-size: 20px; margin: 0 0 4px;">Welcome to XRILL PRO 🚀</h1>
    <p style="font-size: 15px; color: #b3b3b3; margin: 0 0 24px;">Let's get to work.</p>

    <p style="font-size: 15px; line-height: 1.6;">Hey,</p>
    <p style="font-size: 15px; line-height: 1.6;">
      You're officially locked in. Your subscription is active and your account has been
      upgraded in the system.
    </p>

    <p style="font-size: 15px; line-height: 1.6; margin-top: 24px;">Here's how to get set up immediately:</p>

    <ol style="font-size: 15px; line-height: 1.8; padding-left: 20px;">
      <li>
        <strong>Access Your Dashboard &amp; Playbook:</strong> Head over to your
        <a href="${dashboardUrl}" style="color:#f5b301;">Dashboard</a> to check out the
        Double-Up Ladder and session checklists, and dive into the
        <a href="${playbookUrl}" style="color:#f5b301;">Playbook</a> for the core strategy modules.
      </li>
      <li>
        <strong>Link Your Discord:</strong> Go to your
        <a href="${accountUrl}" style="color:#f5b301;">Account Settings</a> to connect your
        Discord account so you get instant access to the private roles and alerts.
      </li>
      <li>
        <strong>Configure Your Workspace:</strong> Keep your trading views and tracking
        updated via your <a href="${accountUrl}" style="color:#f5b301;">Account Dashboard</a>.
      </li>
    </ol>

    <p style="font-size: 15px; line-height: 1.6; margin-top: 24px;">
      If you run into any snags or have questions, just reply directly to this email.
      Let's get some green days.
    </p>

    <p style="font-size: 15px; margin-top: 28px;">— Nyle / XRILL Team</p>
  </div>
  `;
}
