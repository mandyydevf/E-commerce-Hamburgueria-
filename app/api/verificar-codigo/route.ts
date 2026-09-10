import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const codigo = typeof body?.codigo === "string" ? body.codigo.trim() : "";

  if (!email || !codigo) {
    return NextResponse.json({ error: "Informe o e-mail e o código." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: registro, error: erroBusca } = await supabaseAdmin
    .from("codigos_verificacao")
    .select("id, expira_em, usado")
    .eq("email", email)
    .eq("codigo", codigo)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroBusca || !registro) {
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  }

  if (registro.usado) {
    return NextResponse.json(
      { error: "Esse código já foi usado. Peça um novo." },
      { status: 400 }
    );
  }

  if (new Date(registro.expira_em).getTime() < Date.now()) {
    return NextResponse.json({ error: "Esse código expirou. Peça um novo." }, { status: 400 });
  }

  // Cada código só serve uma vez
  await supabaseAdmin
    .from("codigos_verificacao")
    .update({ usado: true })
    .eq("id", registro.id);

  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select(
      "id, status, pagamento_status, valor_total, criado_em, itens_pedido(id, produto_nome, quantidade)"
    )
    .eq("cliente_email", email)
    .order("criado_em", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível buscar os pedidos." },
      { status: 500 }
    );
  }

  return NextResponse.json({ pedidos: data ?? [] });
}
