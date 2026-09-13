import Badge from "@/components/Badge";

export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Grid({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const colClass = cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
  return <div className={`grid grid-cols-2 gap-3 ${colClass}`}>{children}</div>;
}

export function Stat({
  label,
  value,
  badge,
  tone,
}: {
  label: string;
  value: string;
  badge?: { text: string; tone: "good" | "blocked" | "caution" | "info" | "neutral" | "loss" };
  tone?: "good" | "loss";
}) {
  return (
    <div className="rounded border border-white/10 bg-surface p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/50">{label}</div>
        {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
      </div>
      <div className={`mt-1 font-medium ${tone === "good" ? "text-accent" : tone === "loss" ? "text-loss" : ""}`}>{value}</div>
    </div>
  );
}
