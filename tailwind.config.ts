import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#06111F",
        surface: {
          DEFAULT: "#0B1B2D",
          lighter: "#11253E",
          card: "#091728",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "#152E4D",
        },
        ucr: {
          orange: "#FF7900",
          "orange-hover": "#E66D00",
          "orange-light": "rgba(255, 121, 0, 0.15)",
          "orange-glow": "rgba(255, 121, 0, 0.35)",
        },
        uovt: {
          blue: "#24A8FF",
          "blue-hover": "#0F98F5",
          "blue-light": "rgba(36, 168, 255, 0.15)",
          "blue-glow": "rgba(36, 168, 255, 0.35)",
        },
        tpopt: {
          accent: "#FF7900",
          badge: "#FF7900",
          bg: "rgba(255, 121, 0, 0.12)",
          border: "rgba(255, 121, 0, 0.3)",
        },
        tprpt: {
          accent: "#24A8FF",
          badge: "#24A8FF",
          bg: "rgba(36, 168, 255, 0.12)",
          border: "rgba(36, 168, 255, 0.3)",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "orange-glow": "0 0 25px -5px rgba(255, 121, 0, 0.3)",
        "blue-glow": "0 0 25px -5px rgba(36, 168, 255, 0.3)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
