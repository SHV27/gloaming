import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0710",
        deep: "#140B1E",
        surface: "#1E1330",
        rot: "#3B2A57",
        ember: "#F5A623",
        "ember-bright": "#FFD27A",
        bone: "#EDE6D6",
        ash: "#8C8398",
        blood: "#C2412D",
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Spectral", "Georgia", "serif"],
        mono: ["'Space Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        ember: "0 0 24px -2px rgba(245,166,35,0.45)",
        "ember-lg": "0 0 60px -6px rgba(245,166,35,0.55)",
      },
      keyframes: {
        flicker: {
          "0%,100%": { opacity: "1" },
          "45%": { opacity: "0.78" },
          "55%": { opacity: "0.92" },
          "70%": { opacity: "0.7" },
        },
        drift: {
          "0%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(8px,-6px)" },
          "100%": { transform: "translate(0,0)" },
        },
      },
      animation: {
        flicker: "flicker 4s ease-in-out infinite",
        drift: "drift 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
