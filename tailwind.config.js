/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        slowSpin: "spin 2s linear infinite",
      },
    },
  },
  plugins: [],
};
