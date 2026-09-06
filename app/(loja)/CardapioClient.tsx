"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useCarrinho } from "@/lib/CartContext";
import { formatarPreco } from "@/lib/format";
import type { Produto } from "./page";

export default function CardapioClient({ produtos }: { produtos: Produto[] }) {
  const { adicionarItem } = useCarrinho();
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [adicionadoId, setAdicionadoId] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const unicas = Array.from(
      new Set(
        produtos
          .map((p) => p.categoria)
          .filter((c): c is string => Boolean(c && c.trim()))
      )
    );
    return unicas.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [produtos]);

  const produtosFiltrados =
    categoriaAtiva === "todos"
      ? produtos
      : produtos.filter((p) => p.categoria === categoriaAtiva);

  function handleAdicionar(produto: Produto) {
    adicionarItem({ id: produto.id, nome: produto.nome, preco: produto.preco });
    setAdicionadoId(produto.id);
    setTimeout(() => setAdicionadoId(null), 1200);
  }

  return (
    <section className="bg-night">
      {produtos.length === 0 ? (
        <p className="mx-auto max-w-sm px-6 py-14 text-center text-cream/50">
          Nenhum item cadastrado ainda. Assim que o cardápio for preenchido
          no painel, os lanches aparecem aqui.
        </p>
      ) : (
        <>
          {categorias.length > 0 && (
            <div className="sticky top-[65px] z-30 border-b border-charline bg-night/95 backdrop-blur">
              <div
                className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-6 py-3 sm:px-10"
                role="tablist"
                aria-label="Filtrar por categoria"
              >
                <button
                  type="button"
                  onClick={() => setCategoriaAtiva("todos")}
                  className={`flex-shrink-0 rounded-md px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition ${
                    categoriaAtiva === "todos"
                      ? "bg-flame text-night"
                      : "bg-white/5 text-cream/70"
                  }`}
                >
                  Todos
                </button>
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    onClick={() => setCategoriaAtiva(categoria)}
                    className={`flex-shrink-0 rounded-md px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition ${
                      categoriaAtiva === categoria
                        ? "bg-flame text-night"
                        : "bg-white/5 text-cream/70"
                    }`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mx-auto max-w-3xl divide-y divide-charline px-6 sm:px-10">
            {produtosFiltrados.map((produto) => (
              <article key={produto.id} id={`item-${produto.id}`} className="flex scroll-mt-24 gap-4 py-5 first:pt-8">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-nightSurface sm:h-28 sm:w-28">
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
                        className={`h-full w-full object-cover ${
                          !produto.disponivel ? "grayscale" : ""
                        }`}
                      />
                    </a>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-cream/30">
                      sem foto
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-xl tracking-wide text-cream sm:text-2xl">
                      {produto.nome}
                    </h2>
                    {!produto.disponivel && (
                      <span className="flex-shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cream/70">
                        Esgotado
                      </span>
                    )}
                  </div>
                  {produto.descricao && (
                    <p className="mt-0.5 text-sm text-cream/50">
                      {produto.descricao}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="font-bold text-flame">
                      {formatarPreco(produto.preco)}
                    </span>
                    {produto.disponivel && (
                      <button
                        type="button"
                        onClick={() => handleAdicionar(produto)}
                        className="flex items-center gap-1 rounded-md border-2 border-cream/30 px-3 py-1.5 text-sm font-bold text-cream transition hover:border-flame hover:text-flame"
                      >
                        {adicionadoId === produto.id ? (
                          "Adicionado!"
                        ) : (
                          <>
                            <Plus size={16} /> Adicionar
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Foto ampliada, exibida ao clicar na imagem acima */}
                {produto.imagem_url && (
                  <div id={`foto-${produto.id}`} className="lightbox">
                    <a
                      href={`#item-${produto.id}`}
                      className="lightbox-backdrop"
                      aria-label="Fechar foto ampliada"
                    />
                    <div className="lightbox-content">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={produto.imagem_url} alt={produto.nome} />
                      <a
                        href={`#item-${produto.id}`}
                        className="lightbox-close"
                        aria-label="Fechar foto ampliada"
                      >
                        ×
                      </a>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
