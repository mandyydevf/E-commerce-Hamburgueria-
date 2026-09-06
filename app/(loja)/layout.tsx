import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartBar from "@/components/CartBar";

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="bg-night pb-20">{children}</div>
      <Footer />
      <CartBar />
    </>
  );
}
