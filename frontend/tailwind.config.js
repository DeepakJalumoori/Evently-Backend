/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: "#fff5f2",
          100: "#ffe8e2",
          200: "#ffd5ca",
          300: "#ffb4a2",
          400: "#ff8466",
          500: "#ff5733", // Evently primary accent
          600: "#ea4320",
          700: "#c43314",
          800: "#a02d14",
          900: "#822a16",
        },
        charcoal: {
          50: "#f8f9fa",
          100: "#f1f3f5",
          200: "#e9ecef",
          300: "#dee2e6",
          400: "#ced4da",
          500: "#868e96",
          600: "#495057",
          700: "#343a40",
          800: "#212529",
          900: "#121519", // Evently dark primary
          950: "#0b0d10",
        },
        surface: {
          DEFAULT: "#FAFAFA", // Warm off-white
          subtle: "#F4F4F5",
          card: "#FFFFFF",
          border: "#E4E4E7",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        float: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
