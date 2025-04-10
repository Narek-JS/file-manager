/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        slowSpin: "spin 2s linear infinite",
        fadeInOut: "fade-in-out 1.5s ease-in-out forwards",
      },
      keyframes: {
        "fade-in-out": {
          "0%": {
            opacity: "0",
            transform: "translateY(-4px)",
          },
          "20%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "80%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-4px)",
          },
        },
      },
    },
  },
  plugins: [],
};
