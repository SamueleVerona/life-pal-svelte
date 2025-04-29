/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
import scrollbar from "tailwind-scrollbar";
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  safelist: [
    "bg-theme-day",
    "bg-theme-week",
    "bg-theme-month",
    "bg-theme-year",
  ],

  theme: {
    extend: {
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "slide-in-bottom": {
          " 0%": {
            opacity: "0",
            transform: " translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0px)",
          },
        },
        "slide-in-top": {
          " 0%": {
            opacity: "0",
            transform: " translateY(-40px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0px)",
          },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right .8s ease forwards",
        "slide-in-bottom": "slide-in-bottom 2s ease forwards",
        "slide-in-top": "slide-in-top 2s ease forwards",
      },
      backgroundImage: {
        "checkbox-checked": "linear-gradient(var(--checkbox-checked))",
        "theme-bg": "linear-gradient(var(--theme-bg))",
        "logo-bg":
          "linear-gradient(to bottom,var(--theme-primary-dark) 25%, var(--theme-primary-light))",
      },
      colors: {
        "theme-day": "var(--theme-item-day)",
        "theme-week": "var(--theme-item-week)",
        "theme-month": "var(--theme-item-month)",
        "theme-year": "var(--theme-item-year)",
      },
    },
  },

  plugins: [daisyui, scrollbar],
};
