"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { addVisionItem, deleteVisionItem, updateVisionCaption } from "@/app/playbook/actions";

// Personal vision board: polaroids taped to a soft pastel board. Uploads go
// browser -> private "vision-board" bucket (<user_id>/...), then a server
// action links them. Each photo gets a little tilt and a strip of washi
// tape; captions are click-to-edit; tap a photo to see it big.

export interface VisionItem {
  id: number;
  url: string | null;
  caption: string | null;
}

const MAX_ITEMS = 24; // matches app/playbook/actions.ts
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const TAPES = [
  "repeating-linear-gradient(45deg,#f9a8d4cc 0 6px,#fbcfe8cc 6px 12px)",
  "repeating-linear-gradient(45deg,#86efaccc 0 6px,#bbf7d0cc 6px 12px)",
  "repeating-linear-gradient(45deg,#fde68acc 0 6px,#fef3c7cc 6px 12px)",
  "repeating-linear-gradient(45deg,#c4b5fdcc 0 6px,#ddd6fecc 6px 12px)",
  "repeating-linear-gradient(45deg,#7dd3fccc 0 6px,#bae6fdcc 6px 12px)",
];
const tilt = (i: number) => [-3, 2, -1.5, 3, -2.5, 1.5, -1, 2.5][i % 8];

export default function VisionBoard({ items, userId }: { items: VisionItem[]; userId: string | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [zoom, setZoom] = useState<VisionItem | null>(null);

  async function upload(files: FileList | null) {
    if (!files || !userId) return;
    setError(null);
    const list = Array.from(files).slice(0, Math.max(0, MAX_ITEMS - items.length));
    if (list.length === 0) return setError(`Your board holds up to ${MAX_ITEMS} pictures.`);
    setBusy(true);
    const supabase = createClient();
    for (const file of list) {
      if (!ALLOWED.includes(file.type)) {
        setError("PNG, JPG, WEBP or GIF only (on iPhone, pick 'Most Compatible' or share as JPG).");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is over 10 MB.`);
        continue;
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("vision-board").upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        setError(upErr.message);
        continue;
      }
      const res = await addVisionItem({ path });
      if (!res.success) setError(res.error ?? "Couldn't pin that picture.");
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function saveCaption(id: number) {
    setEditing(null);
    const res = await updateVisionCaption(id, draft);
    if (!res.success) setError(res.error ?? "Couldn't save the caption.");
    router.refresh();
  }

  async function remove(id: number) {
    if (!window.confirm("Take this picture off your board?")) return;
    const res = await deleteVisionItem(id);
    if (!res.success) setError(res.error ?? "Couldn't remove it.");
    router.refresh();
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-pink-200/30 p-4 sm:p-6"
      style={{
        background:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0) 0 0 / 18px 18px, linear-gradient(135deg, #f9a8d455, #c4b5fd55 45%, #fdba7455)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-serif text-lg italic text-pink-100 [text-shadow:0_0_12px_rgba(249,168,212,0.6)]">
          ✨ dream it, pin it, trade toward it ✨
        </p>
        {userId && (
          <span className="rounded-full bg-black/30 px-2.5 py-0.5 font-mono text-[10px] text-pink-100/80">
            {items.length}/{MAX_ITEMS} pinned
          </span>
        )}
      </div>

      {error && <p className="mt-2 rounded bg-black/40 px-3 py-1.5 text-xs text-rose-200">{error}</p>}

      {!userId ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 w-20 rounded-sm bg-[#fffdf7] p-1.5 pb-5 shadow-lg" style={{ transform: `rotate(${tilt(i)}deg)` }}>
                <div className="h-full w-full rounded-sm bg-gradient-to-br from-pink-200 via-violet-200 to-amber-100" />
              </div>
            ))}
          </div>
          <p className="text-sm text-white/80">Sign in to build your own private vision board.</p>
          <Link href="/login" className="rounded-full bg-pink-300 px-4 py-1.5 text-xs font-bold text-black hover:bg-pink-200">
            Sign in
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it, i) => (
            <figure
              key={it.id}
              className="group relative rounded-sm bg-[#fffdf7] p-2 pb-3 shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition duration-300 hover:z-10 hover:!rotate-0 hover:scale-[1.04]"
              style={{ transform: `rotate(${tilt(i)}deg)` }}
            >
              {/* washi tape */}
              <span
                aria-hidden="true"
                className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 shadow-sm"
                style={{ background: TAPES[i % TAPES.length], transform: `translateX(-50%) rotate(${-tilt(i) * 1.5}deg)` }}
              />
              <button type="button" onClick={() => setZoom(it)} className="block w-full overflow-hidden rounded-[2px] bg-neutral-200">
                {it.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.url} alt={it.caption ?? "Vision board picture"} className="aspect-square w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-xs text-neutral-500">image unavailable</div>
                )}
              </button>
              <figcaption className="mt-2 min-h-[1.5rem] text-center">
                {editing === it.id ? (
                  <input
                    autoFocus
                    value={draft}
                    maxLength={80}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => saveCaption(it.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveCaption(it.id);
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="w-full border-b border-neutral-400 bg-transparent text-center font-serif text-sm italic text-neutral-800 outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(it.id);
                      setDraft(it.caption ?? "");
                    }}
                    className={`font-serif text-sm italic ${it.caption ? "text-neutral-800" : "text-neutral-400"}`}
                  >
                    {it.caption || "add a caption…"}
                  </button>
                )}
              </figcaption>
              <button
                type="button"
                onClick={() => remove(it.id)}
                aria-label="Remove picture"
                className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow group-hover:flex"
              >
                ×
              </button>
            </figure>
          ))}

          {items.length < MAX_ITEMS && (
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-pink-200/60 bg-white/10 text-pink-50 transition hover:bg-white/20 disabled:opacity-50"
            >
              <span className="text-3xl">{busy ? "⏳" : "📌"}</span>
              <span className="text-xs font-semibold">{busy ? "Pinning…" : "Pin a picture"}</span>
              <span className="text-[10px] text-pink-50/60">goals · places · people · the car</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ALLOWED.join(",")}
            multiple
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
        </div>
      )}

      {zoom?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setZoom(null)}>
          <figure className="max-h-full max-w-3xl rounded bg-[#fffdf7] p-3 pb-4 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom.url} alt={zoom.caption ?? ""} className="max-h-[78vh] w-auto object-contain" />
            {zoom.caption && <figcaption className="mt-2 text-center font-serif italic text-neutral-800">{zoom.caption}</figcaption>}
          </figure>
        </div>
      )}
    </div>
  );
}
