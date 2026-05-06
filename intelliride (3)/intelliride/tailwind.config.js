/** @type {import('tailwindcss').Config} */
export default {
  
  content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
  theme: {
    extend: {
      colors: {
        primary: "#22C55E",
        darkGreen: "#15803D",
        lightGreen: "#DCFCE7",
      },
    },
  },
  plugins: [],
}