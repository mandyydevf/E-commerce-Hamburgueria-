"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCarrinho } from "@/lib/CartContext";
import { formatarPreco } from "@/lib/format";

export default function CartBar() {
  const pathname = usePathname();
  const { totalItens, totalPreco } = useCarrinho();

  const ocultarNestaPagina =
    pathname === "/carrinho" || pathname === "/finalizar";

  if (ocultarNestaPagina || totalItens === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-flame px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.4)]">
      <Link
        href="/carrinho"
        className="mx-auto flex max-w-5xl items-center justify-between text-night"
      >
        <span className="font-bold">
          {totalItens} {totalItens === 1 ? "item" : "itens"} ·{" "}
          {formatarPreco(totalPreco)}
        </span>
        <span className="flex items-center gap-1 font-bold">
          Ver carrinho <ArrowRight size={16} />
        </span>
      </Link>
    </div>
  );
}
