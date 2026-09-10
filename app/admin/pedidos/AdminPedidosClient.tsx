"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { formatarPreco } from "@/lib/format";
import {
  ETAPAS_PEDIDO,
  ETIQUETA_STATUS_GERAL,
  COR_STATUS_GERAL,
  statusGeral,
  type StatusGeral,
  type StatusPagamento,
  type StatusPedido,
} from "@/lib/statusPedido";

type ItemPedido = {
  id: string;
  produto_nome: string;
  tamanho: string | null;
  cor: string | null;
  quantidade: number;
  preco_unitario: number;
};

type Pedido = {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  tipo_entrega: "retirada" | "entrega";
  endereco: string | null;
  status: StatusPedido;
  pagamento_status: StatusPagamento;
  codigo_rastreio: string | null;
  transportadora: string | null;
  motivo_cancelamento: string | null;
  cancelado_por: "cliente" | "loja" | null;
  valor_total: number;
  criado_em: string;
  itens_pedido: ItemPedido[];
};

const FILTROS: { valor: "todos" | StatusGeral; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "aguardando_pagamento", rotulo: "Aguardando pagamento" },
  { valor: "separacao", rotulo: "Em separação" },
  { valor: "enviado", rotulo: "Enviado" },
  { valor: "entregue", rotulo: "Entregue" },
  { valor: "pagamento_recusado", rotulo: "Pagamento recusado" },
  { valor: "cancelado", rotulo: "Cancelado" },
];

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
  switch (statusGeral(pedido)) {
    case "aguardando_pagamento":
      return `Olá ${nome}! Aqui é da Vero Store 👗 Seu pedido está reservado, só falta a confirmação do pagamento do Pix pra gente começar a separar.`;
    case "pagamento_recusado":
      return `Olá ${nome}! O pagamento do seu pedido na Vero Store não foi aprovado. Se quiser, pode tentar de novo pelo site.`;
    case "separacao":
      return `Olá ${nome}! Aqui é da Vero Store 👗 Recebemos seu pedido e já estamos separando as peças!`;
    case "enviado":
      return pedido.tipo_entrega === "retirada"
        ? `Olá ${nome}! Seu pedido está pronto, pode vir buscar na loja 👜`
        : `Olá ${nome}! Seu pedido foi enviado${
            pedido.codigo_rastreio ? ` — código de rastreio: ${pedido.codigo_rastreio}` : ""
          } 📦`;
    case "entregue":
      return `Olá ${nome}! Esperamos que tenha gostado do pedido. Volte sempre! 💛`;
    case "cancelado":
      return `Olá ${nome}! Seu pedido na Vero Store foi cancelado. Qualquer dúvida, é só chamar por aqui.`;
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
  const [filtro, setFiltro] = useState<"todos" | StatusGeral>("todos");
  const [busca, setBusca] = useState("");

  async function atualizarStatus(pedido: Pedido, novoStatus: StatusPedido) {
    let codigoRastreio = pedido.codigo_rastreio;

    if (novoStatus === "enviado" && pedido.tipo_entrega === "entrega" && !codigoRastreio) {
      codigoRastreio = window.prompt(
        "Código de rastreio (opcional, deixe em branco se não tiver):",
        ""
      );
      if (codigoRastreio !== null) codigoRastreio = codigoRastreio.trim() || null;
      else codigoRastreio = pedido.codigo_rastreio;
    }

    const { error } = await supabase
      .from("pedidos")
      .update({ status: novoStatus, codigo_rastreio: codigoRastreio })
      .eq("id", pedido.id);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
      return;
    }

    setPedidos((atuais) =>
      atuais.map((p) =>
        p.id === pedido.id ? { ...p, status: novoStatus, codigo_rastreio: codigoRastreio } : p
      )
    );
  }

  const contagens = useMemo(() => {
    const mapa: Partial<Record<StatusGeral, number>> = {};
    for (const pedido of pedidos) {
      const geral = statusGeral(pedido);
      mapa[geral] = (mapa[geral] ?? 0) + 1;
    }
    return mapa;
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();
    return pedidos.filter((pedido) => {
      const passaFiltro = filtro === "todos" || statusGeral(pedido) === filtro;
      const passaBusca =
        !buscaNormalizada || pedido.cliente_nome.toLowerCase().includes(buscaNormalizada);
      return passaFiltro && passaBusca;
    });
  }, [pedidos, filtro, busca]);

  const faturamentoHoje = pedidos.reduce(
    (soma, p) => (p.pagamento_status === "aprovado" ? soma + p.valor_total : soma),
    0
  );

  return (
    <main className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent">
              vero store
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
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
              <p className="text-xl font-extrabold text-ink">
                {pedidos.length}
              </p>
              <p>pedidos</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-ink">
                {formatarPreco(faturamentoHoje)}
              </p>
              <p>faturamento</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((item) => (
              <button
                key={item.valor}
                type="button"
                onClick={() => setFiltro(item.valor)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                  filtro === item.valor
                    ? "bg-ink text-bg"
                    : "bg-line/60 text-inkSoft hover:bg-line"
                }`}
              >
                {item.rotulo}
                {item.valor !== "todos" && contagens[item.valor] ? ` (${contagens[item.valor]})` : ""}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente..."
            className="ml-auto w-full max-w-[220px] border-2 border-line bg-bg px-3 py-1.5 text-sm text-ink outline-none"
          />
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p className="mt-8 border-2 border-dashed border-line p-6 text-center text-sm text-ink/40">
            Nenhum pedido encontrado.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto border-2 border-line bg-bg">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Entrega</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pedidosFiltrados.map((pedido) => {
                  const geral = statusGeral(pedido);
                  return (
                    <tr key={pedido.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                        {formatarHorario(pedido.criado_em)}
                      </td>
                      <td className="px-4 py-3 font-bold text-ink">{pedido.cliente_nome}</td>
                      <td className="px-4 py-3 text-ink/60">
                        <ul className="space-y-0.5">
                          {pedido.itens_pedido.map((item) => (
                            <li key={item.id}>
                              {item.quantidade}x {item.produto_nome}
                              {(item.tamanho || item.cor) &&
                                ` (${[item.tamanho, item.cor].filter(Boolean).join(", ")})`}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-ink/60">
                        {pedido.tipo_entrega === "entrega"
                          ? `Entrega — ${pedido.endereco}`
                          : "Retirada na loja"}
                        {pedido.codigo_rastreio && (
                          <p className="mt-1 text-xs text-inkSoft">
                            Rastreio: {pedido.codigo_rastreio}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-accent">
                        {formatarPreco(pedido.valor_total)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${COR_STATUS_GERAL[geral]}`}
                        >
                          {ETIQUETA_STATUS_GERAL[geral]}
                        </span>
                        {pedido.status === "cancelado" && (
                          <div className="mt-1 max-w-[220px] text-xs text-inkSoft">
                            {pedido.cancelado_por === "cliente" && (
                              <p className="font-bold text-ink">Cancelado pelo cliente</p>
                            )}
                            {pedido.motivo_cancelamento && <p>Motivo: {pedido.motivo_cancelamento}</p>}
                            {pedido.pagamento_status === "aprovado" && (
                              <p className="mt-0.5 font-bold text-accent">
                                ⚠ Pago — estornar no Mercado Pago
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {pedido.pagamento_status === "aprovado" && (
                            <select
                              value={pedido.status}
                              onChange={(e) =>
                                atualizarStatus(pedido, e.target.value as StatusPedido)
                              }
                              className="border-2 border-line bg-bg px-2 py-1 text-xs font-bold text-ink outline-none"
                            >
                              {ETAPAS_PEDIDO.map((etapa) => (
                                <option key={etapa.valor} value={etapa.valor}>
                                  {etapa.rotulo}
                                </option>
                              ))}
                            </select>
                          )}
                          <a
                            href={linkWhatsapp(pedido)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 border-2 border-accent px-2 py-1 text-xs font-bold text-ink transition hover:bg-accent"
                            aria-label={`Avisar ${pedido.cliente_nome} pelo WhatsApp`}
                          >
                            <MessageCircle size={14} /> Avisar
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
