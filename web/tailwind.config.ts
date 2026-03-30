import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "Menlo", "monospace"],
      },
      colors: {
        page: "#F7F5F0",
        surface: {
          DEFAULT: "#FFFFFF",
          hover: "#F5F3ED",
          active: "#EDEBE5",
          subtle: "#F0EDE6",
        },
        border: {
          DEFAULT: "#E0DDD6",
          light: "#ECEAE3",
        },
        primary: "#1B1B18",
        secondary: "#5C5C57",
        muted: "#9C9C97",
        accent: {
          DEFAULT: "#C4421A",
          hover: "#A83815",
          bg: "#FEF2EE",
          text: "#9E3413",
        },
        success: {
          DEFAULT: "#1A7F37",
          bg: "#DAFBE1",
        },
        info: {
          DEFAULT: "#0550AE",
          bg: "#DDF4FF",
        },
        warn: {
          DEFAULT: "#9A6700",
          bg: "#FFF8C5",
        },
        danger: {
          DEFAULT: "#CF222E",
          bg: "#FFEBE9",
        },
      },
      boxShadow: {
        xs: "0 1px 2px rgba(27,27,24,0.04)",
        soft: "0 2px 8px rgba(27,27,24,0.06)",
        md: "0 4px 16px rgba(27,27,24,0.08)",
        lg: "0 8px 30px rgba(27,27,24,0.10)",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
