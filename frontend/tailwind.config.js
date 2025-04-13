/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // ✅ Ensures Tailwind scans all your files
  theme: {
    extend: {
      colors:{
        primary:"#181B34",
        secondary:"#1E2139",
        accent:"#A855F7",
      },
      backgroundColor:{
        glass:"rgba(255,255,255,0.1)",
      },
      backdropBlur:{
        sm:"4px",
        md:"8px",
        lg:"12px",
      },
    },
  },
  plugins: [],
};
