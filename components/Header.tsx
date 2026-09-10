"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { useCarrinho } from "@/lib/CartContext";
import StatusAberto from "@/components/StatusAberto";

export default function Header({ categorias }: { categorias: string[] }) {
  const { totalItens } = useCarrinho();
  const router = useRouter();
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState("");

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (busca.trim()) params.set("busca", busca.trim());
    router.push(`/?${params.toString()}#colecao`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-ink">
          VERO STORE
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-wide text-ink md:flex">
          <Link href="/#colecao" className="transition hover:text-accent">
            Tudo
          </Link>
          {categorias.map((categoria) => (
            <Link
              key={categoria}
              href={`/?categoria=${encodeURIComponent(categoria)}#colecao`}
              className="transition hover:text-accent"
            >
              {categoria}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <StatusAberto />

          {buscaAberta ? (
            <form onSubmit={handleBuscar} className="flex items-center">
              <input
                autoFocus
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onBlur={() => !busca && setBuscaAberta(false)}
                placeholder="Buscar..."
                className="w-32 border-b border-line bg-transparent px-1 py-1 text-sm text-ink outline-none sm:w-48"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setBuscaAberta(true)}
              className="text-ink transition hover:text-accent"
              aria-label="Buscar produtos"
            >
              <Search size={20} />
            </button>
          )}

          <Link
            href="/carrinho"
            className="relative flex items-center text-ink transition hover:text-accent"
            aria-label="Ver carrinho"
          >
            <ShoppingBag size={20} />
            {totalItens > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-bg">
                {totalItens}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
