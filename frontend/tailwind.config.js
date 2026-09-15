/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EAF1EF", 100: "#CFE0DC", 200: "#9FC2B9", 300: "#6FA396",
          400: "#3F8573", 500: "#1F6354", 600: "#163B36", 700: "#122E2A",
          800: "#0D211E", 900: "#081412",
        },
        accent: {
          50: "#FBF3E3", 100: "#F5E1B8", 200: "#EDCB86", 300: "#E3B156",
          400: "#D89A2C", 500: "#B87F1F", 600: "#8F631A",
        },
        success: { 50: "#EAF2EA", 100: "#D2E4D3", 500: "#4C7A4D", 600: "#3D633E", 700: "#2F4D30" },
        danger:  { 50: "#F7E9E5", 100: "#EDCEC5", 500: "#A6412C", 600: "#8A3423", 700: "#6E2A1C" },
        warning: { 50: "#FBF3E3", 100: "#F5E1B8", 500: "#D89A2C", 600: "#B87F1F", 700: "#8F631A" },
        paper: "#EFEAE0",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Sinhala", "system-ui", "sans-serif"],
        sinhala: ["Noto Sans Sinhala", "Inter", "sans-serif"],
        display: ["Fraunces", "Noto Sans Sinhala", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22, 59, 54, 0.05), 0 4px 12px -2px rgba(22, 59, 54, 0.08)",
      },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(166, 65, 44, 0.45)" },
          "70%": { boxShadow: "0 0 0 18px rgba(166, 65, 44, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(166, 65, 44, 0)" },
        },
      },
      animation: { "pulse-ring": "pulse-ring 1.6s ease-out infinite" },
    },
  },
  plugins: [],
}