import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export const revalidate = 0;

export default async function AdminHomePage() {
  const supabase = createServerSupabaseClient();

  const { count: totalProdutos } = await supabase
    .from("produtos")
    .select("id", { count: "exact", head: true });

  const { count: pedidosPendentes } = await supabase
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("pagamento_status", "aprovado")
    .in("status", ["recebido", "preparo"]);

  return (
    <main className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-widest text-flame">
          serve bem
        </p>
        <h1 className="mt-1 font-display text-4xl tracking-wide text-ink">
          Painel do restaurante
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/admin/pedidos"
          className="group rounded-lg border-2 border-paperLine/50 bg-white p-6 transition hover:border-flame"
        >
          <p className="font-display text-3xl tracking-wide text-ink">
            Pedidos
          </p>
          <p className="mt-1 text-sm text-ink/60">
            Acompanhe e atualize o status dos pedidos
          </p>
          <p className="mt-4 font-display text-5xl tracking-wide text-flame">
            {pedidosPendentes ?? 0}
          </p>
          <p className="text-xs text-ink/50">pendentes agora</p>
        </Link>

        <Link
          href="/admin/produtos"
          className="group rounded-lg border-2 border-paperLine/50 bg-white p-6 transition hover:border-flame"
        >
          <p className="font-display text-3xl tracking-wide text-ink">
            Cardápio
          </p>
          <p className="mt-1 text-sm text-ink/60">
            Cadastre, edite e remova itens do cardápio
          </p>
          <p className="mt-4 font-display text-5xl tracking-wide text-flame">
            {totalProdutos ?? 0}
          </p>
          <p className="text-xs text-ink/50">itens cadastrados</p>
        </Link>
        </div>
      </div>
    </main>
  );
}
