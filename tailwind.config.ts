import type { Config } from "tailwindcss";

const config: Config = {
  // lib/** is now scanned too -- lib/data/headerStyles.ts holds the actual
  // Tailwind class strings for the header-style treatments (shared between
  // HeaderText.tsx and its Account Settings picker), and without this
  // Tailwind's JIT never sees those class names as literal text anywhere
  // in a scanned file, so it silently drops the utilities (bg-clip-text,
  // the arbitrary gradient colors, via-75%, etc) from the built CSS.
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: { 13: "repeat(13, minmax(0, 1fr))" },
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
        // Daytrade Engine's signature color -- a distinct neon light blue,
        // separate from "primary" (#3b82f6), so the fast/riskier engine is
        // never visually confused with the traditional green one.
        daytrade: "#22d3ee",
      },
      keyframes: {
        // Stage-relic strip under the EXP bar — list is doubled, so -50%
        // loops seamlessly.
        "relic-roll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // Star "boop" on click — squash, pop, settle.
        "star-boop": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(0.82)" },
          "60%": { transform: "scale(1.22) rotate(-8deg)" },
          "100%": { transform: "scale(1)" },
        },
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
        "liquid-drift-slow": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        // Purple orbs (Analytics backdrop): each orb drifts on its own
        // slow, wide, slightly-elliptical loop and breathes in opacity —
        // staggered animation-delay per orb keeps them from ever moving
        // in unison.
        "orb-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.35" },
          "33%": { transform: "translate(24px, -30px) scale(1.08)", opacity: "0.7" },
          "66%": { transform: "translate(-18px, 16px) scale(0.94)", opacity: "0.5" },
        },
        // Intelligence page backdrop: a synapse flashing as a signal
        // passes through it. Staggered per-node so the network reads as
        // "firing" rather than blinking together.
        "neuron-flash": {
          "0%, 100%": { opacity: "0.15", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1.3)" },
        },
        // The impulse itself travelling down an axon — a dashed stroke
        // whose offset scrolls the gap along the path, so a bright dash
        // appears to run from cell body to synapse.
        "neuron-impulse": {
          "0%": { strokeDashoffset: "240" },
          "100%": { strokeDashoffset: "0" },
        },
        // Journal page: a book whose top page slowly lifts and turns,
        // then the next page settles under it — a continuous, gentle
        // page-turn loop. Runs on a 3D-perspective parent.
        "book-page-turn": {
          "0%, 8%": { transform: "rotateY(0deg)", opacity: "1" },
          "45%, 55%": { transform: "rotateY(-165deg)", opacity: "0.85" },
          "92%, 100%": { transform: "rotateY(-180deg)", opacity: "0" },
        },
        "holo-sheen": {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
        },
        // Daytrade Engine chrome -- a cyan box-shadow breathing in and out,
        // same technique as exp-glow but in the engine's own neon color.
        "daytrade-glow": {
          "0%, 100%": { boxShadow: "0 0 8px 1px rgba(34,211,238,0.35)" },
          "50%": { boxShadow: "0 0 20px 5px rgba(34,211,238,0.8)" },
        },
        // Intelligence page's Performance Areas bars -- same breathing
        // box-shadow technique as exp-glow/daytrade-glow, in the two colors
        // those bars actually render in (bg-accent / bg-caution), so the
        // glow always matches the fill instead of being a flat overlay.
        "perf-glow-accent": {
          "0%, 100%": { boxShadow: "0 0 6px 1px rgba(34,197,94,0.35)" },
          "50%": { boxShadow: "0 0 14px 3px rgba(34,197,94,0.75)" },
        },
        "perf-glow-caution": {
          "0%, 100%": { boxShadow: "0 0 6px 1px rgba(234,179,8,0.35)" },
          "50%": { boxShadow: "0 0 14px 3px rgba(234,179,8,0.75)" },
        },
        // "Vein" flow -- a thin purple/orange gradient bar that appears
        // under a wizard question once it's answered, its background
        // scrolling sideways on a tiled 200%-width gradient so the color
        // reads as flowing rather than static. Small dopamine hit for
        // answering a gate question, distinct from any pass/fail color.
        "vein-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "relic-roll": "relic-roll 40s linear infinite",
        "star-boop": "star-boop 0.45s ease-out",
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
        "liquid-drift-slow": "liquid-drift-slow 20s linear infinite",
        "orb-float": "orb-float 22s ease-in-out infinite",
        "neuron-flash": "neuron-flash 2.6s ease-in-out infinite",
        "neuron-impulse": "neuron-impulse 2.2s linear infinite",
        "book-page-turn": "book-page-turn 9s ease-in-out infinite",
        "holo-sheen": "holo-sheen 5s ease-in-out infinite",
        "daytrade-glow": "daytrade-glow 2.2s ease-in-out infinite",
        "perf-glow-accent": "perf-glow-accent 2.2s ease-in-out infinite",
        "perf-glow-caution": "perf-glow-caution 2.2s ease-in-out infinite",
        "vein-flow": "vein-flow 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
