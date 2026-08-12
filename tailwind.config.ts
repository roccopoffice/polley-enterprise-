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
          blue: "#153F86",
          navy: "#061024",
          bright: "#2A5CA8",
          black: "#050B16",
          charcoal: "#1C2738",
          gray: "#667180",
          light: "#F3F5F8",
          border: "#D9DEE8",
          white: "#FFFFFF",
          success: "#16A34A",
          gold: "#F5D76E",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(6, 33, 63, 0.10)",
        card: "0 12px 30px rgba(5, 5, 5, 0.08)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
