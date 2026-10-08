import { sendPasswordReset } from "../actions";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <p className="mt-2 text-sm text-white/60">We&apos;ll email you a link to set a new one.</p>

      {searchParams.error && (
        <p className="mt-4 rounded bg-blocked/10 px-3 py-2 text-sm text-blocked">{searchParams.error}</p>
      )}

      <form action={sendPasswordReset} className="mt-6 space-y-3">
        <div>
          <label className="block text-sm text-white/70">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <button className="w-full rounded bg-accent px-3 py-2 text-sm font-medium text-black hover:opacity-90">
          Send reset link
        </button>
        <p className="text-center text-xs">
          <a href="/login" className="text-white/60 hover:text-white">Back to log in</a>
        </p>
      </form>
    </div>
  );
}
