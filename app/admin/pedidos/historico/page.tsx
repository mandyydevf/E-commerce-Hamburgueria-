import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { intervaloDeHojeBrasil } from "@/lib/dataBrasil";
import { formatarPreco } from "@/lib/format";
import {
  ETIQUETA_STATUS_GERAL,
  COR_STATUS_GERAL,
  statusGeral,
  type StatusPagamento,
  type StatusPedido,
} from "@/lib/statusPedido";

export const revalidate = 0;

function formatarDataHora(isoString: string) {
  return new Date(isoString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HistoricoPedidosPage() {
  const supabase = createServerSupabaseClient();
  const { inicio } = intervaloDeHojeBrasil();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(
      "id, cliente_nome, tipo_entrega, status, pagamento_status, codigo_rastreio, valor_total, criado_em, itens_pedido(id, produto_nome, tamanho, cor, quantidade)"
    )
    .lt("criado_em", inicio)
    .order("criado_em", { ascending: false })
    .limit(200);

  return (
    <main className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1 text-sm font-bold text-ink/60"
        >
          <ArrowLeft size={16} /> Voltar pros pedidos de hoje
        </Link>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
          Histórico de pedidos
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          Mostrando os 200 pedidos mais recentes antes de hoje.
        </p>

        {!pedidos || pedidos.length === 0 ? (
          <p className="mt-8 text-sm text-ink/50">
            Nenhum pedido anterior a hoje ainda.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto border border-line bg-bg">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Entrega</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pedidos.map((pedido) => {
                  const geral = statusGeral({
                    status: pedido.status as StatusPedido,
                    pagamento_status: pedido.pagamento_status as StatusPagamento,
                  });
                  return (
                    <tr key={pedido.id}>
                      <td className="px-4 py-3 text-ink/60">
                        {formatarDataHora(pedido.criado_em)}
                      </td>
                      <td className="px-4 py-3 font-bold text-ink">
                        {pedido.cliente_nome}
                      </td>
                      <td className="px-4 py-3 text-ink/60">
                        {pedido.itens_pedido
                          .map((item) => {
                            const variacao = [item.tamanho, item.cor].filter(Boolean).join(", ");
                            return `${item.quantidade}x ${item.produto_nome}${
                              variacao ? ` (${variacao})` : ""
                            }`;
                          })
                          .join(", ")}
                      </td>
                      <td className="px-4 py-3 text-ink/60">
                        {pedido.tipo_entrega === "entrega" ? "Entrega" : "Retirada"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${COR_STATUS_GERAL[geral]}`}
                        >
                          {ETIQUETA_STATUS_GERAL[geral]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-accent">
                        {formatarPreco(pedido.valor_total)}
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
