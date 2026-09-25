import { ImageResponse } from "next/og";

// Same auto-detected convention as icon.tsx, but at the larger size iOS
// wants when someone adds the site to their home screen. No border here --
// at 180x180 the flat rounded square reads better without the thin ring
// icon.tsx uses to help the mark register at 16-32px.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: 110,
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
