import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        enterprise: {
          navy: "#061024",
          "navy-deep": "#030811",
          blue: "#153F86",
          bright: "#2A5CA8",
          gold: "#F5D76E",
          charcoal: "#16202E",
          gray: "#4F5B6B",
          border: "#D8D7D1",
          light: "#EDECE8",
          canvas: "#F6F5F2",
          white: "#FFFFFF",
          success: "#16A34A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sharp: "2px",
        card: "3px",
      },
    },
  },
  plugins: [],
};

export default config;
