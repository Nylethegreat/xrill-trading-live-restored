// Reusable "electric sign" text treatment for section headers/status
// lines (XRILL STATUS, etc.) — a layered green text-shadow glow plus a
// subtle flicker (animate-neon-flicker, tailwind.config.ts). Pass a
// className to override color/size; the glow layers use currentColor so
// they follow whatever text color class is applied.
export default function NeonText({
  children,
  className = "",
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={`motion-safe:animate-neon-flicker [text-shadow:0_0_4px_currentColor,0_0_11px_currentColor,0_0_19px_currentColor] ${className}`}
    >
      {children}
    </Tag>
  );
}
