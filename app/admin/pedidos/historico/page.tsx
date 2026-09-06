import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { intervaloDeHojeBrasil } from "@/lib/dataBrasil";
import { formatarPreco } from "@/lib/format";

export const revalidate = 0;

const NOMES_STATUS: Record<string, string> = {
  recebido: "Recebido",
  preparo: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue",
};

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
      "id, cliente_nome, tipo_entrega, status, valor_total, criado_em, itens_pedido(id, produto_nome, quantidade)"
    )
    .eq("pagamento_status", "aprovado")
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

        <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
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
          <div className="mt-6 overflow-hidden rounded-lg border-2 border-paperLine/50 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Entrega</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paperLine/40">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="px-4 py-3 text-ink/60">
                      {formatarDataHora(pedido.criado_em)}
                    </td>
                    <td className="px-4 py-3 font-bold text-ink">
                      {pedido.cliente_nome}
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {pedido.itens_pedido
                        .map((item) => `${item.quantidade}x ${item.produto_nome}`)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {pedido.tipo_entrega === "entrega" ? "Entrega" : "Retirada"}
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {NOMES_STATUS[pedido.status] ?? pedido.status}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-flame">
                      {formatarPreco(pedido.valor_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
