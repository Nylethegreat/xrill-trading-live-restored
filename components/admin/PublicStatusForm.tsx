"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePublicStatus } from "@/app/admin/alerts/actions";

// Lets the admin update the homepage hero pill ("CURRENT STAGE: ...")
// without touching Supabase directly. Free-text label stored in
// public_status.current_stage (id=1) — purely a marketing figure, separate
// from any real member account balance.
export default function PublicStatusForm({ initialStage }: { initialStage: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialStage);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const res = await updatePublicStatus(value);
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <div className="rounded border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-white/60">Public stage label</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="$500 → $1,000 (Stage 2)"
            className="w-72 rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          disabled={submitting}
          onClick={handleSave}
          className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Update"}
        </button>
      </div>
      <p className="mt-2 text-xs text-white/50">
        Homepage will show: <span className="font-mono text-accent">CURRENT STAGE: {value || "—"}</span>
      </p>
      {error && <p className="mt-2 text-sm text-blocked">{error}</p>}
      {success && <p className="mt-2 text-sm text-accent">Updated.</p>}
    </div>
  );
}
