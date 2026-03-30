import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0d1117",
          1: "#161b22",
          2: "#1c2128",
          3: "#21262d",
          4: "#30363d",
        },
        border: {
          default: "#30363d",
          muted: "#21262d",
        },
        text: {
          primary: "#e6edf3",
          secondary: "#8b949e",
          muted: "#6e7681",
        },
        accent: {
          blue: "#58a6ff",
          green: "#3fb950",
          red: "#f85149",
          orange: "#d29922",
          purple: "#bc8cff",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
