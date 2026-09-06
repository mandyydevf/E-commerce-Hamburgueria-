import { createServerSupabaseClient } from "@/lib/supabaseServer";
import CardapioClient from "./CardapioClient";

export const revalidate = 0;

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  imagem_url: string | null;
  disponivel: boolean;
};

async function getProdutos(): Promise<Produto[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome, descricao, preco, categoria, imagem_url, disponivel")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar produtos:", error.message);
    return [];
  }
  return data ?? [];
}

const FRASE_LETREIRO =
  "FEITO NA BRASA \u00b7 ENTREGA R\u00c1PIDA \u00b7 100% ARTESANAL \u00b7 ";

export default async function CardapioPage() {
  const produtos = await getProdutos();

  return (
    <main className="min-h-screen bg-night">
      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="inline-flex items-center rounded-full border-2 border-dashed border-mustard px-4 py-1 text-xs font-bold uppercase tracking-widest text-mustard">
            100% artesanal
          </div>
          <h1 className="mt-5 font-display text-7xl leading-[0.9] tracking-wide text-cream sm:text-8xl">
            SERVE
            <br />
            <span className="text-flame">BEM</span>
          </h1>
          <p className="mt-5 max-w-sm text-balance text-cream/70">
            Hambúrgueres feitos na brasa, do jeito que hambúrguer tem que ser.
          </p>
          <a
            href="#cardapio"
            className="mt-7 inline-block rounded-md bg-flame px-6 py-3 font-bold uppercase tracking-wide text-night transition hover:opacity-90"
          >
            Ver cardápio
          </a>
        </div>

        {/* Elemento gráfico do hero — troque por uma foto real do hambúrguer
            quando o cliente enviar (veja instruções no README, seção "Hero") */}
        <div className="relative mx-auto flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
          <div className="absolute inset-0 rounded-full bg-flame/20 blur-2xl" />
          <svg
            viewBox="0 0 200 200"
            className="relative h-full w-full"
            aria-hidden="true"
          >
            <circle cx="100" cy="100" r="92" fill="#241B15" />
            {/* pão de cima */}
            <path
              d="M55 92c0-22 20-38 45-38s45 16 45 38H55z"
              fill="#FFC53D"
            />
            <circle cx="72" cy="70" r="2.5" fill="#241B15" />
            <circle cx="92" cy="62" r="2.5" fill="#241B15" />
            <circle cx="112" cy="68" r="2.5" fill="#241B15" />
            <circle cx="128" cy="78" r="2.5" fill="#241B15" />
            {/* alface */}
            <path
              d="M50 94c10-6 20 4 30-2s20 6 30 0 20-4 30 2v8H50z"
              fill="#7A9A5E"
            />
            {/* carne */}
            <rect x="52" y="102" width="96" height="16" rx="8" fill="#7A4B2E" />
            {/* queijo */}
            <path d="M55 118l90 0-8 14H63z" fill="#FFC53D" />
            {/* pão de baixo */}
            <path
              d="M58 132h84c0 10-9 18-19 18H77c-10 0-19-8-19-18z"
              fill="#FF5A1F"
            />
          </svg>
        </div>
      </section>

      {/* Faixa animada tipo letreiro */}
      <div className="marquee border-y border-charline bg-flame py-2.5">
        <div className="marquee-track">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="px-4 font-display text-lg tracking-wide text-night"
            >
              {FRASE_LETREIRO.repeat(6)}
            </span>
          ))}
        </div>
      </div>

      <div id="cardapio">
        <CardapioClient produtos={produtos} />
      </div>
    </main>
  );
}
