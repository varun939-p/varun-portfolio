import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Dynamic color classes used in page.tsx skill cards
    "bg-cyan/10", "bg-purple/10", "bg-blue-400/10", "bg-emerald-400/10", "bg-orange-400/10",
    "border-cyan/20", "border-purple/20", "border-blue-400/20", "border-emerald-400/20", "border-orange-400/20",
    "text-cyan", "text-purple", "text-blue-400", "text-emerald-400", "text-orange-400",
    "hover:border-cyan/60", "hover:border-purple/60", "hover:border-blue-400/60", "hover:border-emerald-400/60", "hover:border-orange-400/60",
    "group-hover:border-cyan/40", "group-hover:border-purple/40", "group-hover:border-blue-400/40", "group-hover:border-emerald-400/40", "group-hover:border-orange-400/40",
    "group-hover:bg-cyan/10", "group-hover:bg-purple/10", "group-hover:bg-blue-400/10", "group-hover:bg-emerald-400/10", "group-hover:bg-orange-400/10",
    "group-hover:shadow-[0_0_25px_rgba(0,210,255,0.5)]", "group-hover:shadow-[0_0_25px_rgba(157,80,187,0.5)]",
    "from-cyan/10", "from-purple/10", "from-blue-400/10", "from-emerald-400/10",
    "border-cyan/40", "border-blue-400/40", "border-purple/40", "border-emerald-400/40",
  ],
  theme: {
    extend: {
      colors: {
        // "Control room at night" palette
        background: "#0a1020",
        ink: "#0a1020",
        slate2: "#131c2e",
        cyan: "#7cc7e8", // glacier: data, links
        purple: "#f5b544", // legacy secondary accent → signal amber
        amber: { DEFAULT: "#f5b544" },
        coral: "#ee8b6f",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
        sans: ["var(--font-sans)", "IBM Plex Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Archivo", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-slow": "pulse 6s ease-in-out infinite",
        "float": "floatUp 4s ease-in-out infinite",
      },
      keyframes: {
        floatUp: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(rgba(0,210,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "cyber-grid": "50px 50px",
      },
    },
  },
  plugins: [],
};
export default config;