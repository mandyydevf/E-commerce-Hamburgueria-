"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useCarrinho } from "@/lib/CartContext";
import { formatarPreco } from "@/lib/format";
import { FRETE_GRATIS_A_PARTIR_DE } from "@/lib/loja";
import type { Produto } from "./page";

function calcularDesconto(preco: number, precoAntigo: number | null) {
  if (!precoAntigo || precoAntigo <= preco) return null;
  return Math.round(((precoAntigo - preco) / precoAntigo) * 100);
}

function ProdutoCard({ produto }: { produto: Produto }) {
  const { adicionarItem } = useCarrinho();

  const variacoes = produto.produto_variacoes ?? [];
  const temVariacoes = variacoes.length > 0;
  const tamanhos = Array.from(new Set(variacoes.map((v) => v.tamanho)));

  // Se só existe uma opção de tamanho (ou de cor), já vem selecionada — o
  // cliente não devia precisar clicar num seletor que só tem uma escolha.
  const [tamanho, setTamanho] = useState<string | null>(
    tamanhos.length === 1 ? tamanhos[0] : null
  );
  const [cor, setCor] = useState<string | null>(() => {
    if (tamanhos.length !== 1) return null;
    const coresDoUnico = Array.from(
      new Set(variacoes.filter((v) => v.tamanho === tamanhos[0]).map((v) => v.cor))
    );
    return coresDoUnico.length === 1 ? coresDoUnico[0] : null;
  });
  const [adicionado, setAdicionado] = useState(false);

  const coresDoTamanho = tamanho
    ? variacoes.filter((v) => v.tamanho === tamanho)
    : variacoes;
  const cores = Array.from(new Set(coresDoTamanho.map((v) => v.cor)));

  const variacaoEscolhida = variacoes.find((v) => v.tamanho === tamanho && v.cor === cor);
  const podeAdicionar =
    produto.disponivel &&
    (!temVariacoes || (tamanho !== null && cor !== null && (variacaoEscolhida?.estoque ?? 0) > 0));

  const desconto = calcularDesconto(produto.preco, produto.preco_antigo);

  function handleTamanho(t: string) {
    setTamanho(t);
    const coresDoNovoTamanho = Array.from(
      new Set(variacoes.filter((v) => v.tamanho === t).map((v) => v.cor))
    );
    setCor(coresDoNovoTamanho.length === 1 ? coresDoNovoTamanho[0] : null);
  }

  function handleAdicionar() {
    if (!podeAdicionar) return;
    adicionarItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      tamanho: temVariacoes ? tamanho : null,
      cor: temVariacoes ? cor : null,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1200);
  }

  return (
    <article className="group flex flex-col border border-line bg-bg">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
        {produto.imagem_url ? (
          <a
            href={`#foto-${produto.id}`}
            className="block h-full w-full cursor-zoom-in"
            aria-label={`Ver foto ampliada de ${produto.nome}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={produto.imagem_url}
              alt={produto.nome}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                !produto.disponivel ? "grayscale" : ""
              }`}
            />
          </a>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-inkSoft">
            sem foto
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {desconto && (
            <span className="bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-bg">
              -{desconto}% OFF
            </span>
          )}
          {produto.preco >= FRETE_GRATIS_A_PARTIR_DE && (
            <span className="border border-ink/30 bg-bg/90 px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
              Frete grátis
            </span>
          )}
        </div>

        {!produto.disponivel && (
          <span className="absolute right-2 top-2 bg-ink px-2 py-0.5 text-[10px] font-bold uppercase text-bg">
            Esgotado
          </span>
        )}

        {produto.imagem_url && (
          <div id={`foto-${produto.id}`} className="lightbox">
            <a
              href={`#produto-${produto.id}`}
              className="lightbox-backdrop"
              aria-label="Fechar foto ampliada"
            />
            <div className="lightbox-content">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={produto.imagem_url} alt={produto.nome} />
              <a
                href={`#produto-${produto.id}`}
                className="lightbox-close"
                aria-label="Fechar foto ampliada"
              >
                ×
              </a>
            </div>
          </div>
        )}
      </div>

      <div id={`produto-${produto.id}`} className="flex flex-1 scroll-mt-24 flex-col p-3 sm:p-4">
        <h2 className="text-sm font-bold text-ink sm:text-base">{produto.nome}</h2>

        <div className="mt-1">
          {produto.preco_antigo && (
            <span className="mr-2 text-xs text-inkSoft line-through">
              {formatarPreco(produto.preco_antigo)}
            </span>
          )}
          <span className="text-lg font-extrabold text-ink">
            {formatarPreco(produto.preco)}
          </span>
          <p className="text-xs text-inkSoft">à vista no Pix</p>
        </div>

        {tamanhos.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-inkSoft">
              Tamanho
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {tamanhos.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTamanho(t)}
                  className={`h-7 min-w-[1.75rem] border px-1.5 text-xs font-bold transition ${
                    tamanho === t ? "border-ink bg-ink text-bg" : "border-line text-ink hover:border-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {tamanho && cores.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-inkSoft">Cor</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {cores.map((c) => {
                const variacao = variacoes.find((v) => v.tamanho === tamanho && v.cor === c);
                const esgotado = (variacao?.estoque ?? 0) <= 0;
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={esgotado}
                    onClick={() => setCor(c)}
                    className={`border px-2 py-1 text-xs font-bold transition ${
                      esgotado
                        ? "cursor-not-allowed border-line text-inkSoft/50 line-through"
                        : cor === c
                        ? "border-ink bg-ink text-bg"
                        : "border-line text-ink hover:border-ink"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleAdicionar}
          disabled={!podeAdicionar}
          className="mt-3 flex items-center justify-center gap-1 border-2 border-ink py-2 text-xs font-bold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-bg disabled:cursor-not-allowed disabled:border-line disabled:text-inkSoft disabled:hover:bg-transparent"
        >
          {adicionado ? (
            "Adicionado!"
          ) : (
            <>
              <Plus size={14} />
              {!produto.disponivel
                ? "Esgotado"
                : temVariacoes && (!tamanho || !cor)
                ? "Escolha tam./cor"
                : "Comprar"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}

function FilterGroup({
  titulo,
  valores,
  selecionados,
  onToggle,
}: {
  titulo: string;
  valores: string[];
  selecionados: string[];
  onToggle: (valor: string) => void;
}) {
  if (valores.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-ink">{titulo}</p>
      <div className="mt-2 space-y-1.5">
        {valores.map((valor) => (
          <label key={valor} className="flex items-center gap-2 text-sm text-inkSoft">
            <input
              type="checkbox"
              checked={selecionados.includes(valor)}
              onChange={() => onToggle(valor)}
              className="accent-ink"
            />
            {valor}
          </label>
        ))}
      </div>
    </div>
  );
}

const PASSO_MOSTRAR_MAIS = 12;

export default function CardapioClient({ produtos }: { produtos: Produto[] }) {
  const searchParams = useSearchParams();
  const categoriaDaUrl = searchParams.get("categoria");
  const buscaDaUrl = searchParams.get("busca") ?? "";

  const [categorias, setCategorias] = useState<string[]>(categoriaDaUrl ? [categoriaDaUrl] : []);
  const [cores, setCores] = useState<string[]>([]);
  const [tamanhos, setTamanhos] = useState<string[]>([]);
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [ordenacao, setOrdenacao] = useState<"relevancia" | "menor" | "maior">("relevancia");
  const [visiveis, setVisiveis] = useState(PASSO_MOSTRAR_MAIS);

  const categoriasDisponiveis = useMemo(
    () =>
      Array.from(
        new Set(produtos.map((p) => p.categoria).filter((c): c is string => Boolean(c && c.trim())))
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [produtos]
  );

  const tamanhosDisponiveis = useMemo(
    () =>
      Array.from(new Set(produtos.flatMap((p) => p.produto_variacoes.map((v) => v.tamanho)))).sort(),
    [produtos]
  );

  const coresDisponiveis = useMemo(
    () =>
      Array.from(new Set(produtos.flatMap((p) => p.produto_variacoes.map((v) => v.cor)))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [produtos]
  );

  function alternar(lista: string[], setLista: (v: string[]) => void, valor: string) {
    setLista(lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);
    setVisiveis(PASSO_MOSTRAR_MAIS);
  }

  const temFiltroAtivo =
    categorias.length > 0 || cores.length > 0 || tamanhos.length > 0 || !!precoMin || !!precoMax || !!buscaDaUrl;

  function limparFiltros() {
    setCategorias([]);
    setCores([]);
    setTamanhos([]);
    setPrecoMin("");
    setPrecoMax("");
  }

  const produtosFiltrados = useMemo(() => {
    let lista = produtos.filter((p) => {
      if (categorias.length && !(p.categoria && categorias.includes(p.categoria))) return false;
      if (cores.length && !p.produto_variacoes.some((v) => cores.includes(v.cor))) return false;
      if (tamanhos.length && !p.produto_variacoes.some((v) => tamanhos.includes(v.tamanho))) return false;
      if (precoMin && p.preco < Number(precoMin)) return false;
      if (precoMax && p.preco > Number(precoMax)) return false;
      if (buscaDaUrl && !p.nome.toLowerCase().includes(buscaDaUrl.toLowerCase())) return false;
      return true;
    });

    if (ordenacao === "menor") lista = [...lista].sort((a, b) => a.preco - b.preco);
    if (ordenacao === "maior") lista = [...lista].sort((a, b) => b.preco - a.preco);

    return lista;
  }, [produtos, categorias, cores, tamanhos, precoMin, precoMax, buscaDaUrl, ordenacao]);

  const produtosVisiveis = produtosFiltrados.slice(0, visiveis);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-xs text-inkSoft">Início / Produtos</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
            {buscaDaUrl ? `Resultados para "${buscaDaUrl}"` : "Todos os produtos"}
          </h2>
        </div>
        <select
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
          className="border border-line bg-bg px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="relevancia">Relevância</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </select>
      </div>

      {produtos.length === 0 ? (
        <p className="py-14 text-center text-inkSoft">
          Nenhuma peça cadastrada ainda. Assim que o catálogo for preenchido
          no painel, as peças aparecem aqui.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-6">
            <FilterGroup
              titulo="Categoria"
              valores={categoriasDisponiveis}
              selecionados={categorias}
              onToggle={(v) => alternar(categorias, setCategorias, v)}
            />
            <FilterGroup
              titulo="Tamanho"
              valores={tamanhosDisponiveis}
              selecionados={tamanhos}
              onToggle={(v) => alternar(tamanhos, setTamanhos, v)}
            />
            <FilterGroup
              titulo="Cor"
              valores={coresDisponiveis}
              selecionados={cores}
              onToggle={(v) => alternar(cores, setCores, v)}
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink">Preço</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="De"
                  value={precoMin}
                  onChange={(e) => {
                    setPrecoMin(e.target.value);
                    setVisiveis(PASSO_MOSTRAR_MAIS);
                  }}
                  className="w-full border border-line bg-bg px-2 py-1.5 text-sm text-ink outline-none"
                />
                <span className="text-inkSoft">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Até"
                  value={precoMax}
                  onChange={(e) => {
                    setPrecoMax(e.target.value);
                    setVisiveis(PASSO_MOSTRAR_MAIS);
                  }}
                  className="w-full border border-line bg-bg px-2 py-1.5 text-sm text-ink outline-none"
                />
              </div>
            </div>
            {temFiltroAtivo && (
              <button
                type="button"
                onClick={limparFiltros}
                className="text-xs font-bold text-inkSoft underline hover:text-ink"
              >
                Limpar filtros
              </button>
            )}
          </aside>

          <div>
            {produtosFiltrados.length === 0 ? (
              <p className="py-14 text-center text-inkSoft">
                Nenhum produto encontrado com esses filtros.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {produtosVisiveis.map((produto) => (
                    <ProdutoCard key={produto.id} produto={produto} />
                  ))}
                </div>
                {visiveis < produtosFiltrados.length && (
                  <button
                    type="button"
                    onClick={() => setVisiveis((v) => v + PASSO_MOSTRAR_MAIS)}
                    className="mx-auto mt-8 block border border-ink px-6 py-2 text-sm font-bold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-bg"
                  >
                    Mostrar mais produtos
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
