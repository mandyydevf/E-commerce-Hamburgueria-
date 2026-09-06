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

export async function GET(request: NextRequest) {
  const pedidoId = request.nextUrl.searchParams.get("pedidoId");

  if (!pedidoId) {
    return NextResponse.json(
      { error: "Informe o pedidoId." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select("pagamento_status, mercado_pago_payment_id")
    .eq("id", pedidoId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 }
    );
  }

  // Se já está num status final, não precisa perguntar de novo ao Mercado Pago
  if (data.pagamento_status === "aprovado" || data.pagamento_status === "rejeitado") {
    return NextResponse.json({ status: data.pagamento_status });
  }

  // Enquanto está "pendente", consultamos a API do Mercado Pago diretamente,
  // em vez de depender só do webhook (que pode falhar por questões de rede
  // fora do nosso controle). Isso garante que o status sempre fique correto.
  if (data.mercado_pago_payment_id) {
    try {
      const resposta = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.mercado_pago_payment_id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
          cache: "no-store",
        }
      );

      if (resposta.ok) {
        const pagamento = await resposta.json();
        const statusMapeado = MAPA_STATUS[pagamento.status] ?? "pendente";

        if (statusMapeado !== data.pagamento_status) {
          await supabaseAdmin
            .from("pedidos")
            .update({ pagamento_status: statusMapeado })
            .eq("id", pedidoId);
        }

        return NextResponse.json({ status: statusMapeado });
      }
    } catch (erroConsulta) {
      console.error("Erro ao consultar pagamento no Mercado Pago:", erroConsulta);
      // Se der erro na consulta, devolve o status que já tínhamos salvo
    }
  }

  return NextResponse.json({ status: data.pagamento_status });
}
