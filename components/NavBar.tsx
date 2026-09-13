import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import Logo from "@/components/Logo";

export default async function NavBar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={22} />
          <span className="font-mono text-sm font-bold tracking-widest text-white">XRILL</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/glossary" className="hover:text-white">Glossary</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/session" className="hover:text-white">Start Session</Link>
              <Link href="/journal" className="hover:text-white">Journal</Link>
              <Link href="/analytics" className="hover:text-white">Analytics</Link>
              <Link href="/intelligence" className="hover:text-white">Intelligence</Link>
              <Link href="/playbook" className="hover:text-white">Playbook</Link>
              <Link href="/account" className="hover:text-white">Account</Link>
              {isAdmin && (
                <Link href="/admin/alerts" className="text-accent hover:text-accent/80">Dispatch Alert</Link>
              )}
              <span className="hidden text-white/40 sm:inline">{user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-gradient-to-r from-primary to-secondary px-3 py-1 font-medium text-white hover:opacity-90"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
