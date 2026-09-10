"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatarPreco } from "@/lib/format";
import {
  ETIQUETA_STATUS_GERAL,
  COR_STATUS_GERAL,
  statusGeral,
  type StatusPagamento,
  type StatusPedido,
} from "@/lib/statusPedido";

type ItemPedido = {
  id: string;
  produto_nome: string;
  quantidade: number;
};

type Pedido = {
  id: string;
  status: StatusPedido;
  pagamento_status: StatusPagamento;
  valor_total: number;
  criado_em: string;
  itens_pedido: ItemPedido[];
};

function formatarData(isoString: string) {
  return new Date(isoString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function MeusPedidosPage() {
  const [telefone, setTelefone] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setBuscando(true);
    setPedidos(null);

    try {
      const resposta = await fetch(
        `/api/buscar-pedidos?telefone=${encodeURIComponent(telefone)}`
      );
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível buscar seus pedidos.");
        return;
      }

      setPedidos(dados.pedidos);
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Meus pedidos</h1>
        <p className="mt-1 text-sm text-inkSoft">
          Digite o telefone usado na compra pra ver o andamento dos seus pedidos.
        </p>

        <form onSubmit={handleBuscar} className="mt-6 flex gap-2">
          <input
            required
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="flex-1 border border-line bg-bg px-3 py-2 text-ink outline-none"
          />
          <button
            type="submit"
            disabled={buscando}
            className="flex items-center gap-2 bg-ink px-4 py-2 text-sm font-bold uppercase tracking-wide text-bg transition hover:opacity-90 disabled:opacity-60"
          >
            <Search size={16} />
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {erro && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {erro}
          </p>
        )}

        {pedidos && pedidos.length === 0 && (
          <p className="mt-8 text-center text-sm text-inkSoft">
            Nenhum pedido encontrado com esse telefone.
          </p>
        )}

        {pedidos && pedidos.length > 0 && (
          <ul className="mt-8 divide-y divide-line border border-line">
            {pedidos.map((pedido) => {
              const geral = statusGeral(pedido);
              return (
                <li key={pedido.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-xs text-inkSoft">
                      {formatarData(pedido.criado_em)} · Pedido #{pedido.id.slice(0, 8)}
                    </p>
                    <p className="mt-0.5 text-sm text-ink">
                      {pedido.itens_pedido
                        .map((item) => `${item.quantidade}x ${item.produto_nome}`)
                        .join(", ")}
                    </p>
                    <p className="mt-1 font-bold text-ink">{formatarPreco(pedido.valor_total)}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-bold ${COR_STATUS_GERAL[geral]}`}
                    >
                      {ETIQUETA_STATUS_GERAL[geral]}
                    </span>
                    <Link
                      href={`/pedido/${pedido.id}`}
                      className="text-xs font-bold text-accent underline"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
