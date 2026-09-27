// Optional decorative palettes for the app's big wordmark-style page
// titles (the homepage "XRILL", "ABOUT XRILL", "XRILL ANALYTICS", etc --
// see components/HeaderText.tsx). Kept in one place so the picker UI, the
// server action's validation, and the header component's render switch
// all read from the same source, same pattern as lib/data/backgroundThemes.ts.
export type HeaderStyle = "white" | "gleam" | "yellow_glow" | "chromatic";

export const HEADER_STYLES: { key: HeaderStyle; label: string; description: string }[] = [
  { key: "white", label: "White", description: "The default — clean, no effect." },
  { key: "gleam", label: "Gleam", description: "The same blue-to-magenta gradient as the XRILL mark." },
  { key: "yellow_glow", label: "Yellow Glow", description: "Warm gold glow, same tone as the XP bar." },
  { key: "chromatic", label: "Chromatic", description: "A red-to-blue sheen with a touch of green." },
];

export function isHeaderStyle(value: string): value is HeaderStyle {
  return HEADER_STYLES.some((s) => s.key === value);
}

// The actual Tailwind treatment for each style -- shared by
// components/HeaderText.tsx (renders real page headers with it) and
// components/account/HeaderStylePicker.tsx (previews it in the swatch
// grid), so the picker can never show something different from what a
// header actually looks like.
export const HEADER_STYLE_CLASS: Record<HeaderStyle, string> = {
  white: "text-white",
  // Warm gold glow -- same currentColor text-shadow technique as
  // NeonText.tsx, tuned to the same amber the EXP bar glows
  // (rgba(250,204,21,...), tailwind.config.ts's exp-glow).
  yellow_glow:
    "text-[#facc15] motion-safe:animate-neon-flicker [text-shadow:0_0_6px_rgba(250,204,21,0.85),0_0_16px_rgba(250,204,21,0.55),0_0_30px_rgba(250,204,21,0.35)]",
  // The XRILL mark's own gradient (Logo.tsx's linearGradient: blue -> violet
  // -> magenta), swept with the same holo-sheen animation used elsewhere
  // (HoloBookFlip.tsx) so it reads as a slow gleam rather than a flat fill.
  gleam:
    "bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#c026d3] bg-clip-text text-transparent bg-[length:200%_200%] motion-safe:animate-holo-sheen [text-shadow:0_0_24px_rgba(139,92,246,0.35)]",
  // Red -> blue with a slight green accent at the tail, same sheen
  // animation as gleam but a different, cooler-to-warm-to-cool mix.
  chromatic:
    "bg-gradient-to-r from-[#ef4444] via-[#3b82f6] via-75% to-[#4ade80] bg-clip-text text-transparent bg-[length:220%_220%] motion-safe:animate-holo-sheen [text-shadow:0_0_24px_rgba(59,130,246,0.3)]",
};
