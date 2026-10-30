"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setLeaderboardOptIn } from "@/app/leaderboard/actions";

export default function OptInButton({ optedIn }: { optedIn: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          setError(null);
          const res = await setLeaderboardOptIn(!optedIn);
          setSaving(false);
          if (!res.success) {
            setError(res.error ?? "Something went wrong.");
            return;
          }
          router.refresh();
        }}
        className={`rounded px-3 py-1.5 text-xs font-bold disabled:opacity-40 ${
          optedIn ? "border border-white/20 text-white/60 hover:border-white/40" : "bg-accent text-black hover:bg-accent/90"
        }`}
      >
        {saving ? "Saving..." : optedIn ? "Leave the board" : "Join the board"}
      </button>
      {error && <p className="mt-1 text-xs text-blocked">{error}</p>}
    </div>
  );
}
