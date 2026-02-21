/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#3b82f6", dark: "#2563eb" },
        surface: { DEFAULT: "#f8fafc", dark: "#1e293b" },
      },
    },
  },
  plugins: [],
};
