import Link from "next/link";
import { Check } from "lucide-react";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { formatarPreco } from "@/lib/format";
import CancelarPedido from "@/components/CancelarPedido";
import type { StatusPagamento, StatusPedido } from "@/lib/statusPedido";

export const revalidate = 0;

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
  tipo_entrega: "retirada" | "entrega";
  status: StatusPedido;
  pagamento_status: StatusPagamento;
  codigo_rastreio: string | null;
  transportadora: string | null;
  motivo_cancelamento: string | null;
  valor_total: number;
  criado_em: string;
  itens_pedido: ItemPedido[];
};

// Ordem das etapas depois que o pagamento é aprovado. Pra quem retira na
// loja, "enviado"/"entregue" viram "pronto"/"retirado" na tela.
const ETAPAS_ENTREGA = ["separacao", "enviado", "entregue"] as const;

async function getPedido(id: string): Promise<Pedido | null> {
  // Usa o cliente admin porque o cliente ainda não está logado — ele só
  // tem o ID do próprio pedido (recebido na hora da compra), o que já é
  // suficiente pra provar que é dele.
  //
  // ⚠️ Nunca selecione cliente_nome/endereco aqui: mesmo com a busca em
  // /meus-pedidos agora exigindo confirmar um código enviado por e-mail,
  // é mais seguro manter essa página sem PII — ela não tem login nenhum,
  // então qualquer vazamento do link (histórico do navegador, print de
  // tela, etc.) não expõe nome nem endereço de ninguém.
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select(
      "id, tipo_entrega, status, pagamento_status, codigo_rastreio, transportadora, motivo_cancelamento, valor_total, criado_em, itens_pedido(id, produto_nome, tamanho, cor, quantidade, preco_unitario)"
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Pedido;
}

export default async function AcompanharPedidoPage({
  params,
}: {
  params: { id: string };
}) {
  const pedido = await getPedido(params.id);

  if (!pedido) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-bg px-6">
        <div className="text-center">
          <p className="text-inkSoft">Não encontramos esse pedido.</p>
          <Link href="/" className="mt-4 inline-block bg-ink px-5 py-2 font-bold text-bg">
            Voltar à loja
          </Link>
        </div>
      </main>
    );
  }

  const retirada = pedido.tipo_entrega === "retirada";
  const rotulos = retirada
    ? ["Em separação", "Pronto para retirada", "Retirado"]
    : ["Em separação", "Enviado", "Entregue"];

  const indiceAtual = ETAPAS_ENTREGA.indexOf(pedido.status as (typeof ETAPAS_ENTREGA)[number]);

  // Só dá pra cancelar antes de ser enviado, e enquanto o pagamento não
  // tiver sido recusado (precisa bater com a regra em
  // app/api/cancelar-pedido/route.ts).
  const podeCancelar =
    pedido.status === "separacao" &&
    pedido.pagamento_status !== "rejeitado" &&
    pedido.pagamento_status !== "expirado";

  return (
    <main className="min-h-screen bg-bg px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs text-inkSoft">Pedido #{pedido.id.slice(0, 8)}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
          Acompanhar pedido
        </h1>

        <div className="mt-8 border border-line bg-surface p-6">
          {pedido.status === "cancelado" ? (
            <div className="text-center">
              <p className="text-sm font-bold text-red-600">Esse pedido foi cancelado.</p>
              {pedido.motivo_cancelamento && (
                <p className="mt-1 text-xs text-inkSoft">
                  Motivo: {pedido.motivo_cancelamento}
                </p>
              )}
            </div>
          ) : pedido.pagamento_status === "pendente" ? (
            <p className="text-center text-sm font-bold text-inkSoft">
              Ainda estamos aguardando a confirmação do seu pagamento via Pix.
              Assim que for aprovado, essa página mostra o andamento do
              pedido.
            </p>
          ) : pedido.pagamento_status === "rejeitado" || pedido.pagamento_status === "expirado" ? (
            <p className="text-center text-sm font-bold text-red-600">
              O pagamento desse pedido não foi aprovado ou expirou.
            </p>
          ) : (
            <div className="flex items-start justify-between gap-2">
              {["Pagamento confirmado", ...rotulos].map((rotulo, indice) => {
                // índice 0 (pagamento) sempre concluído; os demais comparam
                // com a etapa atual do pedido (indiceAtual + 1, já que o
                // pagamento ocupa a posição 0 aqui)
                const concluido = indice <= indiceAtual + 1;
                return (
                  <div key={rotulo} className="flex flex-1 flex-col items-center text-center">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        concluido ? "bg-ink text-bg" : "bg-line text-inkSoft"
                      }`}
                    >
                      {concluido ? <Check size={14} /> : indice + 1}
                    </span>
                    <span
                      className={`mt-2 text-xs font-bold ${concluido ? "text-ink" : "text-inkSoft"}`}
                    >
                      {rotulo}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {pedido.codigo_rastreio && (
            <p className="mt-6 border-t border-line pt-4 text-center text-sm text-inkSoft">
              Código de rastreio: <span className="font-bold text-ink">{pedido.codigo_rastreio}</span>
            </p>
          )}
        </div>

        <div className="mt-6 border border-line bg-surface p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink">
            Itens do pedido
          </h2>
          <p className="mt-1 text-xs text-inkSoft">
            {retirada ? "Retirada na loja" : "Entrega no endereço informado na compra"}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {pedido.itens_pedido.map((item) => (
              <li key={item.id} className="flex justify-between text-inkSoft">
                <span>
                  {item.quantidade}x {item.produto_nome}
                  {(item.tamanho || item.cor) &&
                    ` (${[item.tamanho, item.cor].filter(Boolean).join(", ")})`}
                </span>
                <span>{formatarPreco(item.preco_unitario * item.quantidade)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-3 text-base font-extrabold text-ink">
            <span>Total</span>
            <span>{formatarPreco(pedido.valor_total)}</span>
          </div>

          {podeCancelar && <CancelarPedido pedidoId={pedido.id} />}
        </div>

        <Link href="/" className="mt-6 block text-center text-sm font-bold text-inkSoft underline">
          Voltar à loja
        </Link>
      </div>
    </main>
  );
}
