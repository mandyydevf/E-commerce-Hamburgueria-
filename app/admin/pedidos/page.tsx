import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { intervaloDeHojeBrasil } from "@/lib/dataBrasil";
import AdminPedidosClient from "./AdminPedidosClient";

export const revalidate = 0;

export default async function AdminPedidosPage() {
  const supabase = createServerSupabaseClient();
  const { inicio, fim } = intervaloDeHojeBrasil();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(
      "id, cliente_nome, cliente_telefone, tipo_entrega, endereco, status, valor_total, criado_em, itens_pedido(id, produto_nome, quantidade, preco_unitario)"
    )
    .eq("pagamento_status", "aprovado")
    .gte("criado_em", inicio)
    .lt("criado_em", fim)
    .order("criado_em", { ascending: false });

  const { count: totalAnteriores } = await supabase
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("pagamento_status", "aprovado")
    .lt("criado_em", inicio);

  return (
    <AdminPedidosClient
      pedidosIniciais={pedidos ?? []}
      totalPedidosAnteriores={totalAnteriores ?? 0}
    />
  );
}
