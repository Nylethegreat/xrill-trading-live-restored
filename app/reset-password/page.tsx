import { updatePassword } from "../login/actions";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Set a new password</h1>

      {searchParams.error && (
        <p className="mt-4 rounded bg-blocked/10 px-3 py-2 text-sm text-blocked">{searchParams.error}</p>
      )}

      <form action={updatePassword} className="mt-6 space-y-3">
        <div>
          <label className="block text-sm text-white/70">New password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70">Confirm password</label>
          <input
            name="confirm"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <button className="w-full rounded bg-accent px-3 py-2 text-sm font-medium text-black hover:opacity-90">
          Save password
        </button>
      </form>
    </div>
  );
}
