"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCarrinho } from "@/lib/CartContext";
import StatusAberto from "@/components/StatusAberto";

export default function Header() {
  const { totalItens } = useCarrinho();

  return (
    <header className="sticky top-0 z-40 border-b border-charline bg-night px-6 py-4 sm:px-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-3xl tracking-wide text-cream"
        >
          SERVE BEM
        </Link>
        <div className="flex items-center gap-3">
          <StatusAberto />
          <Link
            href="/carrinho"
            className="relative flex items-center gap-2 rounded-md border border-charline px-3 py-2 text-cream transition hover:bg-white/5"
            aria-label="Ver carrinho"
          >
            <ShoppingBag size={20} />
            {totalItens > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-flame text-xs font-bold text-night">
                {totalItens}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
