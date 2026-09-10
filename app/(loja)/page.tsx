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
      {/* Banner do hero — troque o texto/imagem quando tiver fotos reais da
          loja (veja instruções no README, seção "Hero") */}
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

          <div className="relative mx-auto flex h-48 w-48 items-center justify-center sm:h-64 sm:w-64">
            <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
              <circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="2" />
              <g stroke="#171717" strokeWidth="4" strokeLinecap="round">
                <line x1="100" y1="45" x2="100" y2="155" />
                <line x1="45" y1="100" x2="155" y2="100" />
                <line x1="63" y1="63" x2="137" y2="137" />
                <line x1="137" y1="63" x2="63" y2="137" />
              </g>
              <circle cx="100" cy="100" r="14" fill="#E01233" />
            </svg>
          </div>
        </div>
      </section>

      <div id="colecao">
        <CardapioClient produtos={produtos} />
      </div>
    </main>
  );
}
