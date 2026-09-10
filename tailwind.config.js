/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta única, clara e neutra — loja e painel admin, padrão de
        // e-commerce de mercado (fundo branco, foto do produto em destaque).
        bg: "#FFFFFF",
        surface: "#F7F7F8",
        line: "#E4E4E7",
        ink: "#171717",
        inkSoft: "#6B6B70",
        // Vermelho de destaque — usado com moderação (selos de desconto,
        // avisos, detalhes pontuais), não como cor de fundo geral.
        accent: "#E01233",
      },
      fontFamily: {
        display: ["var(--font-sans)"],
        body: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
