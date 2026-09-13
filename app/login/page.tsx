import { signIn, signUp } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; next?: string };
}) {
  const next = searchParams.next || "/dashboard";

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>

      {searchParams.message && (
        <p className="mt-4 rounded bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {searchParams.message}
        </p>
      )}
      {searchParams.error && (
        <p className="mt-4 rounded bg-blocked/10 px-3 py-2 text-sm text-blocked">
          {searchParams.error}
        </p>
      )}

      <form className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="block text-sm text-white/70">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            formAction={signIn}
            className="flex-1 rounded bg-accent px-3 py-2 text-sm font-medium text-black hover:opacity-90"
          >
            Sign in
          </button>
          <button
            formAction={signUp}
            className="flex-1 rounded border border-white/20 px-3 py-2 text-sm font-medium hover:bg-white/10"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
