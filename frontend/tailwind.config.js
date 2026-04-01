/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:    ["var(--font-mono)", "Courier New", "monospace"],
        display: ["var(--font-display)", "monospace"],
      },
      colors: {
        black:   "#0a0a0a",
        white:   "#f5f5f5",
        red:     "#e63329",
        "red-dark": "#9b1c17",
        "gray-1": "#1a1a1a",
        "gray-2": "#2a2a2a",
        "gray-3": "#3a3a3a",
        "gray-4": "#555555",
        "gray-5": "#888888",
      },
      animation: {
        blink:   "blink 1s step-end infinite",
        pulse:   "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        fadeIn:  "fadeIn 0.4s ease forwards",
        slideUp: "slideUp 0.3s ease forwards",
      },
      keyframes: {
        blink:   { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
