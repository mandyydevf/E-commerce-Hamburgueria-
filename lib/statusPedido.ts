// Lógica de status dos pedidos — compartilhada entre a lista de hoje e o
// histórico, pra manter os rótulos e cores sempre iguais nos dois lugares.

export type StatusPagamento = "pendente" | "aprovado" | "rejeitado" | "expirado";
export type StatusPedido = "separacao" | "enviado" | "entregue" | "cancelado";

export type PedidoParaStatus = {
  status: StatusPedido;
  pagamento_status: StatusPagamento;
};

// Status "geral" mostrado pro lojista: junta a etapa de pagamento com a
// etapa de separação/envio num único selo, do jeito que painéis de loja
// online costumam mostrar.
export type StatusGeral =
  | "aguardando_pagamento"
  | "pagamento_recusado"
  | "separacao"
  | "enviado"
  | "entregue"
  | "cancelado";

export function statusGeral(pedido: PedidoParaStatus): StatusGeral {
  if (pedido.status === "cancelado") return "cancelado";
  if (pedido.pagamento_status === "pendente") return "aguardando_pagamento";
  if (pedido.pagamento_status === "rejeitado" || pedido.pagamento_status === "expirado") {
    return "pagamento_recusado";
  }
  return pedido.status;
}

export const ETIQUETA_STATUS_GERAL: Record<StatusGeral, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pagamento_recusado: "Pagamento recusado",
  separacao: "Em separação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const COR_STATUS_GERAL: Record<StatusGeral, string> = {
  aguardando_pagamento: "bg-line text-inkSoft",
  pagamento_recusado: "bg-red-100 text-red-700",
  separacao: "bg-accent/15 text-accent",
  enviado: "bg-ink/10 text-ink",
  entregue: "bg-ink text-bg",
  cancelado: "bg-red-100 text-red-700",
};

// Etapas que o lojista pode escolher manualmente (pagamento é automático,
// via Mercado Pago — por isso não entra aqui).
export const ETAPAS_PEDIDO: { valor: StatusPedido; rotulo: string }[] = [
  { valor: "separacao", rotulo: "Em separação" },
  { valor: "enviado", rotulo: "Enviado" },
  { valor: "entregue", rotulo: "Entregue" },
  { valor: "cancelado", rotulo: "Cancelado" },
];
