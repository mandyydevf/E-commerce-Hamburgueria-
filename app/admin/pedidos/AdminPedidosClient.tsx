"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { formatarPreco } from "@/lib/format";

type ItemPedido = {
  id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
};

type Status = "recebido" | "preparo" | "pronto" | "entregue";

type Pedido = {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  tipo_entrega: "retirada" | "entrega";
  endereco: string | null;
  status: Status;
  valor_total: number;
  criado_em: string;
  itens_pedido: ItemPedido[];
};

const COLUNAS: { status: Status; titulo: string; cor: string }[] = [
  { status: "recebido", titulo: "Recebido", cor: "bg-flame" },
  { status: "preparo", titulo: "Em preparo", cor: "bg-mustard" },
  { status: "pronto", titulo: "Pronto", cor: "bg-mustard" },
  { status: "entregue", titulo: "Entregue", cor: "bg-ink/60" },
];

const PROXIMO_STATUS: Record<Status, Status | null> = {
  recebido: "preparo",
  preparo: "pronto",
  pronto: "entregue",
  entregue: null,
};

// Quantos cards mostrar por coluna antes de precisar clicar em "Ver todos"
const LIMITE_VISIVEL = 5;

function formatarHorario(isoString: string) {
  return new Date(isoString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function telefoneParaWhatsapp(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

function mensagemPorStatus(pedido: Pedido) {
  const nome = pedido.cliente_nome.split(" ")[0];
  switch (pedido.status) {
    case "recebido":
      return `Olá ${nome}! Aqui é da Serve Bem 🍔 Recebemos seu pedido e já vamos começar a preparar!`;
    case "preparo":
      return `Olá ${nome}! Seu pedido já está sendo preparado na brasa 🔥`;
    case "pronto":
      return pedido.tipo_entrega === "retirada"
        ? `Olá ${nome}! Seu pedido está pronto, pode vir buscar no balcão 🍔`
        : `Olá ${nome}! Seu pedido está pronto e já vai sair pra entrega 🛵`;
    case "entregue":
      return `Olá ${nome}! Esperamos que tenha gostado do pedido. Volte sempre! 🍔`;
  }
}

function linkWhatsapp(pedido: Pedido) {
  const numero = telefoneParaWhatsapp(pedido.cliente_telefone);
  const mensagem = encodeURIComponent(mensagemPorStatus(pedido));
  return `https://wa.me/${numero}?text=${mensagem}`;
}

export default function AdminPedidosClient({
  pedidosIniciais,
  totalPedidosAnteriores,
}: {
  pedidosIniciais: Pedido[];
  totalPedidosAnteriores: number;
}) {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais);
  const [colunaModal, setColunaModal] = useState<Status | null>(null);

  async function avancarStatus(pedido: Pedido) {
    const proximo = PROXIMO_STATUS[pedido.status];
    if (!proximo) return;

    const { error } = await supabase
      .from("pedidos")
      .update({ status: proximo })
      .eq("id", pedido.id);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
      return;
    }

    setPedidos((atuais) =>
      atuais.map((p) => (p.id === pedido.id ? { ...p, status: proximo } : p))
    );
  }

  const totalHoje = pedidos.reduce((soma, p) => soma + p.valor_total, 0);

  function renderPedidoCard(pedido: Pedido) {
    return (
      <div
        key={pedido.id}
        className="rounded-md border-2 border-paperLine/50 bg-white p-4"
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-ink">{pedido.cliente_nome}</span>
          <span className="text-xs text-ink/50">
            {formatarHorario(pedido.criado_em)}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink/60">
          {pedido.tipo_entrega === "entrega"
            ? `Entrega — ${pedido.endereco}`
            : "Retirada no balcão"}
        </p>
        <ul className="mt-2 space-y-0.5 text-xs text-ink/70">
          {pedido.itens_pedido.map((item) => (
            <li key={item.id}>
              {item.quantidade}x {item.produto_nome}
            </li>
          ))}
        </ul>
        <p className="mt-2 font-bold text-flame">
          {formatarPreco(pedido.valor_total)}
        </p>
        <div className="mt-3 flex gap-2">
          <a
            href={linkWhatsapp(pedido)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1 rounded-md border-2 border-mustard px-2 py-1.5 text-xs font-bold text-ink transition hover:bg-mustard"
          >
            <MessageCircle size={14} /> Avisar
          </a>
          {PROXIMO_STATUS[pedido.status] && (
            <button
              onClick={() => avancarStatus(pedido)}
              className="flex-1 rounded-md bg-ink px-2 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              Avançar
            </button>
          )}
        </div>
      </div>
    );
  }

  const pedidosDoModal = colunaModal
    ? pedidos.filter((p) => p.status === colunaModal)
    : [];

  return (
    <main className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-flame">
              serve bem
            </p>
            <h1 className="mt-1 font-display text-4xl tracking-wide text-ink">
              Pedidos de hoje
            </h1>
            {totalPedidosAnteriores > 0 && (
              <Link
                href="/admin/pedidos/historico"
                className="mt-1 inline-block text-sm text-ink/50 underline"
              >
                Ver histórico ({totalPedidosAnteriores} pedidos anteriores)
              </Link>
            )}
          </div>
          <div className="flex gap-6 text-sm text-ink/70">
            <div>
              <p className="font-display text-2xl tracking-wide text-ink">
                {pedidos.length}
              </p>
              <p>pedidos</p>
            </div>
            <div>
              <p className="font-display text-2xl tracking-wide text-ink">
                {formatarPreco(totalHoje)}
              </p>
              <p>faturamento</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COLUNAS.map((coluna) => {
            const pedidosDaColuna = pedidos.filter(
              (p) => p.status === coluna.status
            );
            const visiveis = pedidosDaColuna.slice(0, LIMITE_VISIVEL);
            const restantes = pedidosDaColuna.length - visiveis.length;

            return (
              <div key={coluna.status}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${coluna.cor}`} />
                  <h2 className="font-display text-lg tracking-wide text-ink">
                    {coluna.titulo}
                  </h2>
                  <span className="text-ink/40">
                    ({pedidosDaColuna.length})
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {pedidosDaColuna.length === 0 ? (
                    <p className="rounded-md border-2 border-dashed border-paperLine/50 p-4 text-center text-xs text-ink/40">
                      Nenhum pedido aqui
                    </p>
                  ) : (
                    <>
                      {visiveis.map(renderPedidoCard)}
                      {restantes > 0 && (
                        <button
                          onClick={() => setColunaModal(coluna.status)}
                          className="w-full rounded-md border-2 border-dashed border-paperLine px-3 py-2 text-xs font-bold text-ink/60 transition hover:border-flame hover:text-flame"
                        >
                          Ver todos ({pedidosDaColuna.length})
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal com a lista completa de uma coluna */}
      {colunaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setColunaModal(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-paperLine pb-3">
              <h3 className="font-display text-2xl tracking-wide text-ink">
                {COLUNAS.find((c) => c.status === colunaModal)?.titulo} (
                {pedidosDoModal.length})
              </h3>
              <button
                onClick={() => setColunaModal(null)}
                className="text-ink/50 transition hover:text-flame"
                aria-label="Fechar"
              >
                <X size={22} />
              </button>
            </div>
            <div className="mt-4 space-y-3 overflow-y-auto">
              {pedidosDoModal.map(renderPedidoCard)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
