import { ImageResponse } from "next/og";

// Next.js App Router convention: a file literally named icon.tsx here is
// auto-detected as the site favicon (and browser-tab/bookmark icon) with
// no <link> tag needed. Kept intentionally simple -- a bold monospace "X"
// on the site's own background color, in the accent green used everywhere
// else (EXP bar glow, Save Outcome button, etc.) -- so it reads clearly
// even at 16x16.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07080f",
          borderRadius: 7,
          border: "1px solid rgba(34,197,94,0.35)",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: 20,
            lineHeight: 1,
            color: "#22c55e",
          }}
        >
          X
        </span>
      </div>
    ),
    { ...size }
  );
}
