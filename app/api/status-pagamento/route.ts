import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

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
    .select("pagamento_status")
    .eq("id", pedidoId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({ status: data.pagamento_status });
}
