// A small holographic book on the Journal page, its top page slowly
// lifting and turning on a loop, like a closed logbook idling open. Pure
// CSS 3D transforms (perspective + rotateY) on a stack of absolutely
// positioned "page" divs, each with a cyan/blue holographic gradient and a
// staggered animation-delay so a new page appears to turn every few
// seconds rather than all four flipping in unison. No images, no JS.

const PAGE_COUNT = 4;

export default function HoloBookFlip({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="relative mx-auto" style={{ width: 120, height: 90, perspective: 600 }}>
        {/* book spine / cover */}
        <div className="absolute inset-0 rounded-sm border border-primary/30 bg-surface/80 shadow-[0_0_20px_-4px_rgba(59,130,246,0.5)]" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/40" />

        {Array.from({ length: PAGE_COUNT }).map((_, i) => (
          <div
            key={i}
            className="absolute right-1/2 top-0 h-full w-1/2 origin-left animate-book-page-turn rounded-r-sm"
            style={{
              animationDelay: `${i * 2.2}s`,
              background:
                "linear-gradient(135deg, rgba(103,232,249,0.35), rgba(59,130,246,0.15) 40%, rgba(192,38,211,0.15) 100%)",
              backgroundSize: "200% 200%",
              border: "1px solid rgba(103,232,249,0.35)",
              boxShadow: "0 0 12px -2px rgba(103,232,249,0.6)",
            }}
          />
        ))}

        {/* holographic sheen sweeping across the whole book */}
        <div
          className="absolute inset-0 rounded-sm opacity-60 mix-blend-screen animate-holo-sheen"
          style={{
            background:
              "linear-gradient(115deg, transparent 20%, rgba(103,232,249,0.5) 45%, rgba(192,38,211,0.4) 55%, transparent 80%)",
            backgroundSize: "220% 220%",
          }}
        />
      </div>
    </div>
  );
}
