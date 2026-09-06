import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

const MAPA_STATUS: Record<string, string> = {
  approved: "aprovado",
  rejected: "rejeitado",
  cancelled: "rejeitado",
  refunded: "rejeitado",
  charged_back: "rejeitado",
  in_process: "pendente",
  pending: "pendente",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = request.nextUrl;

    // O Mercado Pago pode enviar o ID do pagamento no corpo ou na URL,
    // dependendo de como a notificação foi configurada.
    const paymentId =
      body?.data?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    if (!paymentId) {
      // Nada pra processar, mas respondemos 200 pra não gerar reenvios.
      return NextResponse.json({ ok: true });
    }

    // Nunca confiamos cegamente no conteúdo do webhook — buscamos o
    // pagamento de verdade na API do Mercado Pago pra confirmar o status.
    const resposta = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!resposta.ok) {
      return NextResponse.json({ ok: true });
    }

    const pagamento = await resposta.json();
    const statusMapeado = MAPA_STATUS[pagamento.status] ?? "pendente";

    const supabaseAdmin = createAdminClient();
    await supabaseAdmin
      .from("pedidos")
      .update({ pagamento_status: statusMapeado })
      .eq("mercado_pago_payment_id", String(paymentId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook do Mercado Pago:", error);
    // Sempre responde 200 — evita que o Mercado Pago fique reenviando
    // a mesma notificação indefinidamente por causa de um erro nosso.
    return NextResponse.json({ ok: true });
  }
}
