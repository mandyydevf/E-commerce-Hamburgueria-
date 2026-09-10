import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { intervaloDeHojeBrasil, intervaloDoMesBrasil } from "@/lib/dataBrasil";
import { formatarPreco } from "@/lib/format";

export const revalidate = 0;

async function somaValorTotal(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  inicio: string,
  fim: string
) {
  const { data } = await supabase
    .from("pedidos")
    .select("valor_total")
    .eq("pagamento_status", "aprovado")
    .gte("criado_em", inicio)
    .lt("criado_em", fim);

  return (data ?? []).reduce((soma, pedido) => soma + pedido.valor_total, 0);
}

export default async function AdminHomePage() {
  const supabase = createServerSupabaseClient();
  const { inicio: inicioHoje, fim: fimHoje } = intervaloDeHojeBrasil();
  const { inicio: inicioMes, fim: fimMes } = intervaloDoMesBrasil();

  const [
    { count: totalProdutos },
    { count: produtosEsgotados },
    { count: aguardandoPagamento },
    { count: paraSepararOuEnviar },
    faturamentoHoje,
    faturamentoMes,
  ] = await Promise.all([
    supabase.from("produtos").select("id", { count: "exact", head: true }),
    supabase
      .from("produtos")
      .select("id", { count: "exact", head: true })
      .eq("disponivel", false),
    supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("pagamento_status", "pendente"),
    supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("pagamento_status", "aprovado")
      .in("status", ["separacao", "enviado"]),
    somaValorTotal(supabase, inicioHoje, fimHoje),
    somaValorTotal(supabase, inicioMes, fimMes),
  ]);

  return (
    <main className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">
          vero store
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
          Painel da loja
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="border border-line bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-inkSoft">
              Faturamento hoje
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {formatarPreco(faturamentoHoje)}
            </p>
          </div>
          <div className="border border-line bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-inkSoft">
              Faturamento no mês
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {formatarPreco(faturamentoMes)}
            </p>
          </div>
          <div className="border border-line bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-inkSoft">
              Aguardando pagamento
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {aguardandoPagamento ?? 0}
            </p>
          </div>
          <div className="border border-line bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-inkSoft">
              Pra separar/enviar
            </p>
            <p className="mt-1 text-2xl font-extrabold text-accent">
              {paraSepararOuEnviar ?? 0}
            </p>
          </div>
          <div className="border border-line bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-inkSoft">
              Produtos esgotados
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {produtosEsgotados ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            href="/admin/pedidos"
            className="border border-line bg-surface p-6 transition hover:border-accent"
          >
            <p className="text-2xl font-extrabold tracking-tight text-ink">
              Pedidos
            </p>
            <p className="mt-1 text-sm text-inkSoft">
              Acompanhe pagamentos, separação e envio dos pedidos
            </p>
          </Link>

          <Link
            href="/admin/produtos"
            className="border border-line bg-surface p-6 transition hover:border-accent"
          >
            <p className="text-2xl font-extrabold tracking-tight text-ink">
              Produtos
            </p>
            <p className="mt-1 text-sm text-inkSoft">
              Cadastre, edite e remova peças do catálogo
            </p>
            <p className="mt-4 text-4xl font-extrabold text-accent">
              {totalProdutos ?? 0}
            </p>
            <p className="text-xs text-inkSoft">itens cadastrados</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
