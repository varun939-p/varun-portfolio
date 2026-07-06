import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#040405",
        cyan: "#00d2ff",
        purple: "#9d50bb",
      },
      fontFamily: {
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;