import type { Metadata } from "next";
import { Bebas_Neue, Karla } from "next/font/google";
import "./globals.css";
import { CarrinhoProvider } from "@/lib/CartContext";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Serve Bem Hamburgueria",
  description: "Hambúrgueres artesanais — peça pelo cardápio online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${karla.variable}`}>
      <body className="font-body bg-bg">
        <CarrinhoProvider>{children}</CarrinhoProvider>
      </body>
    </html>
  );
}
