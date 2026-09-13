type BadgeTone = "good" | "blocked" | "caution" | "info" | "neutral" | "loss";

const TONE_CLASSES: Record<BadgeTone, string> = {
  good: "bg-accent/15 text-accent border-accent/30",
  blocked: "bg-blocked/15 text-blocked border-blocked/30",
  caution: "bg-caution/15 text-caution border-caution/30",
  info: "bg-primary/15 text-primary border-primary/30",
  neutral: "bg-white/10 text-white/70 border-white/20",
  loss: "bg-loss/15 text-loss border-loss/30",
};

export default function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
