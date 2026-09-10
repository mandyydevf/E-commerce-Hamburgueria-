import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import CardapioClient from "./CardapioClient";
import type { Variacao } from "@/lib/tamanhos";

export const revalidate = 0;

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  preco_antigo: number | null;
  categoria: string | null;
  imagem_url: string | null;
  disponivel: boolean;
  produto_variacoes: Variacao[];
};

async function getProdutos(): Promise<Produto[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("produtos")
    .select(
      "id, nome, descricao, preco, preco_antigo, categoria, imagem_url, disponivel, produto_variacoes(tamanho, cor, estoque)"
    )
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar produtos:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function CardapioPage() {
  const produtos = await getProdutos();

  return (
    <main className="min-h-screen bg-bg">
      {/* Banner do hero — pra trocar a foto depois, é só substituir o
          arquivo public/hero.jpg por outro com o mesmo nome */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              Nova coleção
            </p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Moda alternativa fora do padrão
            </h1>
            <p className="mt-4 max-w-md text-balance text-inkSoft">
              Peças autorais, produção própria, feitas pra quem não segue a
              manada. Pagamento fácil e rápido via Pix.
            </p>
            <Link
              href="#colecao"
              className="mt-6 inline-block bg-ink px-6 py-3 text-sm font-bold uppercase tracking-wide text-bg transition hover:opacity-90"
            >
              Ver coleção
            </Link>
          </div>

          <div className="relative mx-auto h-64 w-56 sm:h-80 sm:w-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero.png" alt="Vero Store" className="h-full w-full object-contain" />
          </div>
        </div>
      </section>

      <div id="colecao">
        <CardapioClient produtos={produtos} />
      </div>
    </main>
  );
}
