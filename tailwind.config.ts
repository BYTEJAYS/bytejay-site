import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#0A0A0A",
        surface: "#141414",
        ink: { DEFAULT: "#FAFAFA", soft: "#A8A29E" },
        muted: "#8F8B84",
        line: "#262626",
        accent: { DEFAULT: "#FF4D24", soft: "#2A150C" },
        pop: "#21FFC0",
      },
      fontFamily: {
        display: ["var(--font-space)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        hand: ["var(--font-caveat)", "cursive"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
