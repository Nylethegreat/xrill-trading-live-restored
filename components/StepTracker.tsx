const STEPS = [
  { key: "daily", label: "Daily\nCheck-In" },
  { key: "gate", label: "Trade\nGate" },
  { key: "setup", label: "Setup\nScore" },
  { key: "plan", label: "Trade\nPlan" },
  { key: "risk", label: "Risk\nManager" },
  { key: "execution", label: "Execution\nCheck" },
  { key: "result", label: "Trade\nScore" },
] as const;

export default function StepTracker({ current }: { current: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current || (current === "blocked" && false));
  const activeIndex = currentIndex === -1 ? STEPS.length - 1 : currentIndex;

  return (
    <div className="mb-8 flex items-start justify-between overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
        return (
          <div key={step.key} className="flex flex-1 items-start">
            <div className="flex flex-col items-center gap-1.5 px-1">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  state === "done"
                    ? "border-accent bg-accent/20 text-accent"
                    : state === "active"
                    ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                    : "border-white/15 bg-white/5 text-white/40"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </div>
              <span className="whitespace-pre-line text-center text-[10px] leading-tight text-white/50">
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mt-4 h-0.5 flex-1 ${i < activeIndex ? "bg-accent/50" : "bg-white/10"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
