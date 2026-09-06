import { NextRequest, NextResponse } from "next/server";
import { mercadoPagoPayment } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { pedidoId, valor, nome, email } = await request.json();

    if (!pedidoId || !valor || !nome) {
      return NextResponse.json(
        { error: "Dados incompletos para criar o pagamento." },
        { status: 400 }
      );
    }

    // O Mercado Pago exige um e-mail do pagador. Como nosso checkout não
    // torna isso obrigatório, usamos um e-mail interno como reserva.
    const emailPagador =
      email && String(email).trim() ? String(email).trim() : `pedido-${pedidoId}@servebem.com`;

    const partesNome = String(nome).trim().split(" ");

    const resultado = await mercadoPagoPayment.create({
      body: {
        transaction_amount: Number(valor),
        description: `Pedido Serve Bem #${String(pedidoId).slice(0, 8)}`,
        payment_method_id: "pix",
        payer: {
          email: emailPagador,
          first_name: partesNome[0] || "Cliente",
          last_name: partesNome.slice(1).join(" ") || "Serve Bem",
        },
        external_reference: pedidoId,
        notification_url: process.env.SITE_URL
          ? `${process.env.SITE_URL}/api/webhook-mercadopago`
          : undefined,
      },
      requestOptions: {
        // Evita criar pagamentos duplicados se a requisição for reenviada
        idempotencyKey: pedidoId,
      },
    });

    const qrCode = resultado.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 =
      resultado.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qrCode || !qrCodeBase64) {
      return NextResponse.json(
        { error: "O Mercado Pago não retornou um QR Code válido." },
        { status: 502 }
      );
    }

    // Salva o ID do pagamento no pedido, pra depois conseguirmos vincular
    // a confirmação (webhook) a este pedido específico.
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin
      .from("pedidos")
      .update({ mercado_pago_payment_id: String(resultado.id) })
      .eq("id", pedidoId);

    return NextResponse.json({
      paymentId: resultado.id,
      qrCode,
      qrCodeBase64,
    });
  } catch (error: unknown) {
    console.error("Erro ao criar pagamento Pix:", error);
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao processar pagamento: " + mensagem },
      { status: 500 }
    );
  }
}
