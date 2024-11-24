/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        graybg: "#191919",
        lightgray: "#9B9B9B",
        notearea: "#34374a",
        sidebar: "#21222c",
        h1: "#F8F8F2",
        h2: "#E9E9E9",
        h3: "#D1D1D1",
        blist: "#F8F8F2",
        tlist: "#F8F8F2",
        textcol: "#D1CFC9",
        floatfont : "#dbd781"
      },
    },
  },
  plugins: [],
};
