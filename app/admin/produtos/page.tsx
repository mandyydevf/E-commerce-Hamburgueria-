import { createServerSupabaseClient } from "@/lib/supabaseServer";
import AdminProdutosClient from "./AdminProdutosClient";

export const revalidate = 0;

export default async function AdminProdutosPage() {
  const supabase = createServerSupabaseClient();

  const { data: produtos } = await supabase
    .from("produtos")
    .select("id, nome, descricao, preco, categoria, imagem_url, disponivel")
    .order("criado_em", { ascending: false });

  return <AdminProdutosClient produtosIniciais={produtos ?? []} />;
}
