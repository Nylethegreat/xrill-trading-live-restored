"use client";

// Small pill-style option picker used by the page backdrop settings
// (neurons on Intelligence, leaves on Analytics). Purely presentational;
// the caller owns the state.
export default function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
  activeClass = "bg-white/15 text-white",
  className = "",
}: {
  label?: string;
  options: { key: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  activeClass?: string;
  className?: string;
}) {
  return (
    <div className={`relative z-10 inline-flex items-center gap-2 ${className}`}>
      {label && <span className="text-[11px] uppercase tracking-wide text-white/40">{label}</span>}
      <div className="inline-flex gap-1 rounded-full border border-white/10 bg-background/60 p-1">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={value === o.key}
            onClick={() => onChange(o.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value === o.key ? activeClass : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
