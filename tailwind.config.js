/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/client/getEmoteHtml.ts",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
