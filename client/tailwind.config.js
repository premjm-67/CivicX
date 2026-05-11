/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        high: "#ef4444",
        medium: "#f97316",
        low: "#22c55e",
      },
    },
  },
  plugins: [],
}