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
      },
      animation: {
        // EKG heartbeat line — the SVG polyline is duplicated end-to-end,
        // so a seamless -50% scroll loops it forever.
        "ekg-scroll": "ekg-scroll 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
