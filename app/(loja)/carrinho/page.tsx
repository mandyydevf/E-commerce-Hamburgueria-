"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useCarrinho } from "@/lib/CartContext";
import { formatarPreco } from "@/lib/format";

export default function CarrinhoPage() {
  const { itens, alterarQuantidade, removerItem, totalPreco } = useCarrinho();

  return (
    <main className="min-h-screen bg-bg px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-bold text-inkSoft transition hover:text-ink"
        >
          <ArrowLeft size={16} /> Voltar à coleção
        </Link>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
          Seu carrinho
        </h1>

        {itens.length === 0 ? (
          <div className="mt-8 border border-dashed border-line bg-surface p-8 text-center">
            <p className="text-inkSoft">Seu carrinho está vazio por enquanto.</p>
            <Link
              href="/"
              className="mt-4 inline-block bg-ink px-5 py-2 font-bold text-bg"
            >
              Ver coleção
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 divide-y divide-line border border-line">
              {itens.map((item) => (
                <li
                  key={item.chave}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-[140px] flex-1">
                    <p className="font-bold text-ink">{item.nome}</p>
                    <p className="text-sm text-inkSoft">
                      {(item.tamanho || item.cor) && (
                        <>
                          {[item.tamanho, item.cor].filter(Boolean).join(" · ")} ·{" "}
                        </>
                      )}
                      {formatarPreco(item.preco)} cada
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        alterarQuantidade(item.chave, item.quantidade - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center border border-line text-ink"
                      aria-label={`Diminuir quantidade de ${item.nome}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-bold text-ink">
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        alterarQuantidade(item.chave, item.quantidade + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center border border-line text-ink"
                      aria-label={`Aumentar quantidade de ${item.nome}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="w-20 text-right font-bold text-ink">
                    {formatarPreco(item.preco * item.quantidade)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removerItem(item.chave)}
                    className="text-inkSoft transition hover:text-accent"
                    aria-label={`Remover ${item.nome}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between bg-surface px-5 py-4">
              <span className="text-lg font-extrabold uppercase tracking-tight text-ink">
                Total
              </span>
              <span className="text-lg font-extrabold text-ink">
                {formatarPreco(totalPreco)}
              </span>
            </div>

            <Link
              href="/finalizar"
              className="mt-6 block bg-ink px-5 py-3 text-center text-sm font-bold uppercase tracking-wide text-bg transition hover:opacity-90"
            >
              Finalizar pedido
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
