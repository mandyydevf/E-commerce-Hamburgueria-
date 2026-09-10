import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartBar from "@/components/CartBar";
import PromoBar from "@/components/PromoBar";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export const revalidate = 0;

async function getCategorias(): Promise<string[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("produtos")
    .select("categoria")
    .not("categoria", "is", null);

  const unicas = Array.from(
    new Set((data ?? []).map((p) => p.categoria).filter((c): c is string => Boolean(c && c.trim())))
  );
  return unicas.sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export default async function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categorias = await getCategorias();

  return (
    <>
      <PromoBar />
      <Header categorias={categorias} />
      <div className="bg-bg pb-20">{children}</div>
      <Footer />
      <CartBar />
    </>
  );
}
