import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#BFFF00",
        "gray-100": "#EBEBEB",
        "gray-200": "#D6D6D6",
        "gray-400": "#9D9D9D",
        "gray-600": "#545454",
        "near-black": "#141313",
      },
      fontFamily: {
        display: ['"Libre Baskerville"', "Georgia", "serif"],
        body: ["Manrope", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
