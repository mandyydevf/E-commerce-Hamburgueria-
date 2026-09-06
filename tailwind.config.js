/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema escuro (loja / lado do cliente)
        night: "#1C1410",
        nightSurface: "#241B15",
        cream: "#F5EDE4",
        charline: "#4A3B30",
        // Cores de marca (usadas nos dois temas)
        flame: "#FF5A1F",
        mustard: "#FFC53D",
        // Tema claro (painel admin)
        paper: "#F6F1EA",
        paperLine: "#E4DACB",
        ink: "#2A211B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
