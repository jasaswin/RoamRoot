/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: "#183A37", deep: "#102B28" },
        sage: { DEFAULT: "#6B8F71", light: "#A8BDA5" },
        cream: "#F7F3EA",
        sand: "#DCCDB8",
        terracotta: { DEFAULT: "#C86B4A", soft: "#E5A58F" },
        charcoal: "#202522",
        muted: "#6B716D",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,43,40,0.06), 0 8px 24px rgba(16,43,40,0.06)",
        lift: "0 2px 4px rgba(16,43,40,0.08), 0 16px 40px rgba(16,43,40,0.14)",
      },
    },
  },
  plugins: [],
};
