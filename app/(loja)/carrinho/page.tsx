"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useCarrinho } from "@/lib/CartContext";
import { formatarPreco } from "@/lib/format";

export default function CarrinhoPage() {
  const { itens, alterarQuantidade, removerItem, totalPreco } = useCarrinho();

  return (
    <main className="min-h-screen bg-night px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-bold text-cream/60 transition hover:text-flame"
        >
          <ArrowLeft size={16} /> Voltar ao cardápio
        </Link>

        <h1 className="mt-3 font-display text-4xl tracking-wide text-cream">
          Seu carrinho
        </h1>

        {itens.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-charline bg-nightSurface p-8 text-center">
            <p className="text-cream/50">Seu carrinho está vazio por enquanto.</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-md bg-flame px-5 py-2 font-bold text-night"
            >
              Ver cardápio
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 divide-y divide-charline rounded-lg border border-charline bg-nightSurface">
              {itens.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-[140px] flex-1">
                    <p className="font-display text-xl tracking-wide text-cream">
                      {item.nome}
                    </p>
                    <p className="text-sm text-cream/50">
                      {formatarPreco(item.preco)} cada
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        alterarQuantidade(item.id, item.quantidade - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-cream/30 text-cream"
                      aria-label={`Diminuir quantidade de ${item.nome}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-bold text-cream">
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        alterarQuantidade(item.id, item.quantidade + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-cream/30 text-cream"
                      aria-label={`Aumentar quantidade de ${item.nome}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="w-20 text-right font-bold text-flame">
                    {formatarPreco(item.preco * item.quantidade)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removerItem(item.id)}
                    className="text-cream/30 transition hover:text-flame"
                    aria-label={`Remover ${item.nome}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between rounded-lg bg-flame px-5 py-4 text-night">
              <span className="font-display text-2xl tracking-wide">
                Total
              </span>
              <span className="font-display text-2xl tracking-wide">
                {formatarPreco(totalPreco)}
              </span>
            </div>

            <Link
              href="/finalizar"
              className="mt-6 block rounded-md border-2 border-flame px-5 py-3 text-center font-bold text-flame transition hover:bg-flame hover:text-night"
            >
              Finalizar pedido
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
