import { NextRequest, NextResponse } from "next/server";
import { mercadoPagoPayment } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { pedidoId, nome, email } = await request.json();

    if (!pedidoId || !nome) {
      return NextResponse.json(
        { error: "Dados incompletos para criar o pagamento." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // ⚠️ Nunca confiamos no valor enviado pelo navegador — recalculamos o
    // total aqui, usando o preço REAL de cada produto salvo no banco.
    // Isso impede que alguém manipule o valor da cobrança pelo navegador.
    const { data: itensPedido, error: erroItens } = await supabaseAdmin
      .from("itens_pedido")
      .select("quantidade, produtos(preco)")
      .eq("pedido_id", pedidoId);

    if (erroItens || !itensPedido || itensPedido.length === 0) {
      return NextResponse.json(
        { error: "Não foi possível calcular o valor do pedido." },
        { status: 400 }
      );
    }

    const valorReal = itensPedido.reduce((soma: number, item: any) => {
      const preco = item.produtos?.preco ?? 0;
      return soma + preco * item.quantidade;
    }, 0);

    if (valorReal <= 0) {
      return NextResponse.json(
        { error: "Valor do pedido inválido." },
        { status: 400 }
      );
    }

    // O Mercado Pago exige um e-mail do pagador. Como nosso checkout não
    // torna isso obrigatório, usamos um e-mail interno como reserva.
    const emailPagador =
      email && String(email).trim() ? String(email).trim() : `pedido-${pedidoId}@verostore.com`;

    const partesNome = String(nome).trim().split(" ");

    const resultado = await mercadoPagoPayment.create({
      body: {
        transaction_amount: valorReal,
        description: `Pedido Vero Store #${String(pedidoId).slice(0, 8)}`,
        payment_method_id: "pix",
        payer: {
          email: emailPagador,
          first_name: partesNome[0] || "Cliente",
          last_name: partesNome.slice(1).join(" ") || "Vero Store",
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

    // Salva o ID do pagamento e o valor real cobrado, pra manter tudo
    // consistente (o cliente pode ter mostrado um total diferente na tela,
    // mas o que realmente vale é o que foi calculado aqui).
    await supabaseAdmin
      .from("pedidos")
      .update({
        mercado_pago_payment_id: String(resultado.id),
        valor_total: valorReal,
      })
      .eq("id", pedidoId);

    return NextResponse.json({
      paymentId: resultado.id,
      qrCode,
      qrCodeBase64,
      valor: valorReal,
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
