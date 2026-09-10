import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

function apenasDigitos(texto: string) {
  return texto.replace(/\D/g, "");
}

export async function GET(request: NextRequest) {
  const telefone = request.nextUrl.searchParams.get("telefone") ?? "";
  const digitosBusca = apenasDigitos(telefone);

  if (digitosBusca.length < 10) {
    return NextResponse.json(
      { error: "Informe um telefone válido, com DDD." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  // Não dá pra comparar telefone formatado direto no banco (o cliente pode
  // ter digitado com ou sem parênteses/traço na hora da compra), então
  // trazemos os pedidos e comparamos só os dígitos aqui.
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select(
      "id, cliente_telefone, status, pagamento_status, valor_total, criado_em, itens_pedido(id, produto_nome, quantidade)"
    )
    .order("criado_em", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível buscar os pedidos." },
      { status: 500 }
    );
  }

  const pedidos = (data ?? [])
    .filter((pedido) => apenasDigitos(pedido.cliente_telefone) === digitosBusca)
    .map((pedido) => ({
      id: pedido.id,
      status: pedido.status,
      pagamento_status: pedido.pagamento_status,
      valor_total: pedido.valor_total,
      criado_em: pedido.criado_em,
      itens_pedido: pedido.itens_pedido,
    }));

  return NextResponse.json({ pedidos });
}
