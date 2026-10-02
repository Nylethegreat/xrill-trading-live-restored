"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addScreenshot, deleteScreenshot, deleteTrim, saveTrim } from "@/app/journal/actions";
import { AFTER_FACT_REASONS } from "@/lib/afterFact";
import type { ScreenshotRow, TrimRow } from "@/lib/data/xrill-analytics-data";

const inputClass = "w-full rounded border border-white/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-accent";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/heic"];

function money(v: number) {
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toFixed(2)}`;
}

// ---------------------------------------------------------- Screenshots
// Uploads go straight from the browser into the private bucket under
// <userId>/<sessionId>/..., then the server action links the file to the
// session (and enforces the per-trade cap). Viewing uses the signed URLs
// the journal page generated.
export function ScreenshotStrip({
  userId,
  sessionId,
  shots,
}: {
  userId: string;
  sessionId: number;
  shots: ScreenshotRow[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!ALLOWED.includes(file.type)) return setError("PNG, JPG, WEBP, GIF or HEIC images only.");
    if (file.size > MAX_BYTES) return setError("That image is over 5 MB.");
    setBusy(true);
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "png";
    const path = `${userId}/${sessionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const supabase = createClient();
    const { error: upErr } = await supabase.storage.from("trade-screenshots").upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      setBusy(false);
      return setError(upErr.message);
    }
    const res = await addScreenshot({ sessionId, path });
    setBusy(false);
    if (!res.success) return setError(res.error ?? "Couldn't save the screenshot.");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">📸 Chart / Setup Screenshots</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded border border-white/20 px-2.5 py-1 text-xs text-white/70 hover:border-accent hover:text-accent disabled:opacity-40"
        >
          {busy ? "Uploading..." : "+ Add screenshot"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) upload(f);
          }}
        />
      </div>
      {shots.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {shots.map((s) => (
            <div key={s.id} className="group relative h-20 w-28 overflow-hidden rounded border border-white/15 bg-black/30">
              {s.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.url}
                  alt="Trade screenshot"
                  className="h-full w-full cursor-zoom-in object-cover"
                  onClick={() => setPreview(s.url)}
                />
              ) : (
                <span className="flex h-full items-center justify-center text-[10px] text-white/40">unavailable</span>
              )}
              <button
                type="button"
                onClick={async () => {
                  const res = await deleteScreenshot(s.id);
                  if (!res.success) setError(res.error ?? "Couldn't delete.");
                  else router.refresh();
                }}
                className="absolute right-1 top-1 hidden rounded bg-black/70 px-1.5 text-[10px] text-white/80 hover:text-loss group-hover:block"
                aria-label="Delete screenshot"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-white/35">Your chart at entry and exit — future you will thank you. Up to 6 per trade.</p>
      )}
      {error && <p className="mt-1 text-xs text-blocked">{error}</p>}

      {preview && (
        <button
          type="button"
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-4"
          aria-label="Close preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Trade screenshot, full size" className="max-h-full max-w-full rounded" />
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------ Mishaps
// "When things don't go to plan because of real life": tick what got in
// the way so the miss is on record instead of forgotten.
export function MishapChecklist({
  value,
  onChange,
  note,
  onNote,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  note: string;
  onNote: (v: string) => void;
}) {
  return (
    <div className="mt-3 rounded border border-caution/25 bg-caution/5 p-3">
      <p className="text-xs font-semibold text-caution">Anything go off-plan? Journal the mishap (optional)</p>
      <p className="mt-0.5 text-[11px] text-white/45">
        Real life happens. Mark what got in the way so it&apos;s a lesson on record, not a habit you didn&apos;t notice.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {AFTER_FACT_REASONS.map((r) => {
          const on = value.includes(r);
          return (
            <button
              key={r}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((x) => x !== r) : [...value, r])}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                on ? "border-caution bg-caution/20 text-caution" : "border-white/15 text-white/55 hover:text-white/80"
              }`}
            >
              {on ? "✓ " : ""}
              {r}
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <input
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="What happened? Did you still follow your capital sleeve?"
          className={`${inputClass} mt-2`}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------- Trims
export function TrimPanel({
  sessionId,
  opened,
  trims,
}: {
  sessionId: number;
  opened: number | null;
  trims: TrimRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contracts, setContracts] = useState("1");
  const [exitPrice, setExitPrice] = useState("");
  const [pl, setPl] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = trims.reduce((s, t) => s + t.contracts, 0);
  const remaining = opened !== null ? opened - trimmed : null;
  const trimPl = trims.reduce((s, t) => s + t.profit_loss, 0);
  const canTrim = remaining !== null && remaining > 1;

  return (
    <div className="mt-3">
      {trims.length > 0 && (
        <div className="mb-2 rounded border border-white/10 bg-white/5 p-2 text-xs">
          <p className="text-white/60">
            ✂️ Trimmed {trimmed} of {opened} · {remaining} still open ·{" "}
            <span className={trimPl >= 0 ? "text-accent" : "text-loss"}>{money(trimPl)} booked</span>
          </p>
          <ul className="mt-1 space-y-0.5">
            {trims.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 font-mono text-[11px] text-white/50">
                <span>
                  {new Date(t.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ·{" "}
                  {t.contracts}x{t.exit_price !== null ? ` @ $${t.exit_price.toFixed(2)}` : ""} ·{" "}
                  <span className={t.profit_loss >= 0 ? "text-accent" : "text-loss"}>{money(t.profit_loss)}</span>
                  {t.note ? ` · ${t.note}` : ""}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await deleteTrim(t.id);
                    if (!res.success) setError(res.error ?? "Couldn't undo.");
                    else router.refresh();
                  }}
                  className="text-white/30 hover:text-loss"
                >
                  undo
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!open ? (
        <button
          type="button"
          disabled={!canTrim}
          onClick={() => setOpen(true)}
          title={canTrim ? "" : "Trimming needs at least 2 contracts open — use Record Outcome for a full close."}
          className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:border-caution hover:text-caution disabled:cursor-not-allowed disabled:opacity-35"
        >
          ✂️ Trim Position
        </button>
      ) : (
        <div className="rounded border border-caution/30 bg-caution/5 p-3">
          <p className="mb-2 text-xs text-white/60">
            Close part of the position and book that slice now. The rest stays open ({remaining} contracts open; trim up to{" "}
            {remaining !== null ? remaining - 1 : "—"}).
          </p>
          <div className="grid grid-cols-3 gap-2">
            <label className="block text-xs">
              <span className="mb-1 block text-white/60">Contracts to trim</span>
              <input type="number" min={1} step={1} value={contracts} onChange={(e) => setContracts(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block text-white/60">Exit premium</span>
              <input type="number" step="any" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block text-white/60">P/L on this trim ($)</span>
              <input type="number" step="0.01" value={pl} onChange={(e) => setPl(e.target.value)} placeholder="+40.00" className={inputClass} />
            </label>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why trim here? (optional)" className={`${inputClass} mt-2`} />
          {error && <p className="mt-1 text-xs text-blocked">{error}</p>}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy || pl.trim() === ""}
              onClick={async () => {
                setBusy(true);
                setError(null);
                const res = await saveTrim({
                  sessionId,
                  contracts: parseInt(contracts, 10),
                  exitPrice: exitPrice.trim() ? parseFloat(exitPrice) : null,
                  profitLoss: parseFloat(pl),
                  note,
                });
                setBusy(false);
                if (!res.success) return setError(res.error ?? "Couldn't save the trim.");
                setOpen(false);
                setPl("");
                setExitPrice("");
                setNote("");
                router.refresh();
              }}
              className="rounded bg-caution px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
            >
              {busy ? "Saving..." : "Book Trim"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded px-3 py-1.5 text-xs text-white/50 hover:text-white/80">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
