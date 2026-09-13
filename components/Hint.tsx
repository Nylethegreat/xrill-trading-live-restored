// Small inline "(?)" tooltip for a technical term. Pure CSS hover/focus reveal
// — no client state needed — so it drops into any step of the wizard without
// extra wiring.
export default function Hint({ text }: { text: string }) {
  return (
    <span tabIndex={0} className="group relative ml-1.5 inline-flex cursor-help align-middle outline-none">
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/30 text-[10px] leading-none text-white/50 group-hover:border-primary group-hover:text-primary group-focus:border-primary group-focus:text-primary">
        ?
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-56 -translate-x-1/2 rounded border border-white/10 bg-surface p-2 text-[11px] font-normal normal-case leading-snug text-white/80 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">
        {text}
      </span>
    </span>
  );
}
