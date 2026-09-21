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
        // EXP bar retention glow — a gold box-shadow breathing in and out
        // around the track, independent of the fill width itself.
        "exp-glow": {
          "0%, 100%": { boxShadow: "0 0 6px 1px rgba(250,204,21,0.35)" },
          "50%": { boxShadow: "0 0 16px 4px rgba(250,204,21,0.75)" },
        },
        // Neon sign flicker for status text — mostly steady, with two
        // quick dips per cycle so it reads as "electric" rather than a
        // plain fade.
        "neon-flicker": {
          "0%, 92%, 100%": { opacity: "1" },
          "94%": { opacity: "0.55" },
          "96%": { opacity: "1" },
          "98%": { opacity: "0.7" },
        },
        // Super Star: slow figure-eight-ish drift so it never looks like
        // it's on a mechanical loop.
        "star-drift": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(18px, -14px) rotate(8deg)" },
          "50%": { transform: "translate(0, -24px) rotate(0deg)" },
          "75%": { transform: "translate(-18px, -14px) rotate(-8deg)" },
        },
        "star-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // Liquid footer plasma — tiled content duplicated end-to-end,
        // same -50% loop trick as wins-scroll-y / ekg-scroll.
        "liquid-drift": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        // EKG heartbeat line — the SVG polyline is duplicated end-to-end,
        // so a seamless -50% scroll loops it forever.
        "ekg-scroll": "ekg-scroll 2.4s linear infinite",
        "candle-pulse": "candle-pulse 3.2s ease-in-out infinite",
        "candle-drift": "candle-drift 18s ease-in-out infinite",
        "wins-scroll-y": "wins-scroll-y 26s linear infinite",
        "exp-glow": "exp-glow 2.2s ease-in-out infinite",
        "neon-flicker": "neon-flicker 4.5s linear infinite",
        "star-drift": "star-drift 14s ease-in-out infinite",
        "star-spin": "star-spin 6s linear infinite",
        "liquid-drift": "liquid-drift 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
