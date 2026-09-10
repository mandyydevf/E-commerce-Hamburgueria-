import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

// Precisa bater exatamente com MOTIVOS_CANCELAMENTO em
// components/CancelarPedido.tsx.
const MOTIVOS_VALIDOS = [
  "Mudei de ideia",
  "Encontrei um preço melhor em outro lugar",
  "Coloquei os dados errados na compra",
  "Demorei demais pra decidir e não quero mais",
  "Outro motivo",
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const pedidoId = body?.pedidoId;
  const motivo = body?.motivo;
  const detalhe = typeof body?.detalhe === "string" ? body.detalhe.trim().slice(0, 300) : "";

  if (!pedidoId || !MOTIVOS_VALIDOS.includes(motivo)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: pedido, error: erroBusca } = await supabaseAdmin
    .from("pedidos")
    .select("status, pagamento_status")
    .eq("id", pedidoId)
    .single();

  if (erroBusca || !pedido) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  // Só dá pra cancelar antes de ser enviado, e enquanto o pagamento não
  // tiver sido recusado (nesse caso já não há nada pra cancelar).
  const podeCancelar =
    pedido.status === "separacao" &&
    pedido.pagamento_status !== "rejeitado" &&
    pedido.pagamento_status !== "expirado";

  if (!podeCancelar) {
    return NextResponse.json(
      { error: "Esse pedido não pode mais ser cancelado por aqui." },
      { status: 400 }
    );
  }

  const motivoFinal = detalhe ? `${motivo}: ${detalhe}` : motivo;

  const { error: erroUpdate } = await supabaseAdmin
    .from("pedidos")
    .update({
      status: "cancelado",
      motivo_cancelamento: motivoFinal,
      cancelado_por: "cliente",
    })
    .eq("id", pedidoId);

  if (erroUpdate) {
    return NextResponse.json(
      { error: "Não foi possível cancelar o pedido." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
