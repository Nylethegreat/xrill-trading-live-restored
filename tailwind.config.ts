import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#07080f",
        surface: "#0f1220",
        foreground: "#e8eaf5",
        accent: "#22c55e",
        caution: "#eab308",
        blocked: "#a855f7",
        primary: "#3b82f6",
        secondary: "#c026d3",
        loss: "#ef4444",
      },
      keyframes: {
        "ekg-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // Slow "breathing" glow for the background candlesticks — each bar
        // is given a staggered animation-delay so the pulse cascades down
        // the series instead of blinking in unison.
        "candle-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scaleY(1)" },
          "50%": { opacity: "1", transform: "scaleY(1.05)" },
        },
        // Very slow, small-amplitude horizontal drift for the whole candle
        // group — reads as "alive" without ever revealing an edge or loop seam.
        "candle-drift": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-10px)" },
        },
        // Wins ticker in the hero backdrop — content is duplicated
        // end-to-end (see WinsTicker.tsx), so a seamless -50% vertical
        // scroll loops it forever, same trick as ekg-scroll on the X axis.
        "wins-scroll-y": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
      animation: {
        // EKG heartbeat line — the SVG polyline is duplicated end-to-end,
        // so a seamless -50% scroll loops it forever.
        "ekg-scroll": "ekg-scroll 2.4s linear infinite",
        "candle-pulse": "candle-pulse 3.2s ease-in-out infinite",
        "candle-drift": "candle-drift 18s ease-in-out infinite",
        "wins-scroll-y": "wins-scroll-y 26s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
