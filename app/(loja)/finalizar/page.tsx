"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { useCarrinho } from "@/lib/CartContext";
import { createClient } from "@/lib/supabaseClient";
import { formatarPreco } from "@/lib/format";

type EtapaCheckout = "formulario" | "pagamento" | "concluido" | "recusado";

export default function FinalizarPage() {
  const { itens, totalPreco, limparCarrinho } = useCarrinho();
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"retirada" | "entrega">(
    "retirada"
  );
  const [endereco, setEndereco] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [etapa, setEtapa] = useState<EtapaCheckout>("formulario");
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Consulta o status do pagamento a cada 4 segundos enquanto aguarda
  useEffect(() => {
    if (etapa !== "pagamento" || !pedidoId) return;

    intervaloRef.current = setInterval(async () => {
      try {
        const resposta = await fetch(`/api/status-pagamento?pedidoId=${pedidoId}`);
        const dados = await resposta.json();

        if (dados.status === "aprovado") {
          if (intervaloRef.current) clearInterval(intervaloRef.current);
          limparCarrinho();
          setEtapa("concluido");
        } else if (dados.status === "rejeitado" || dados.status === "expirado") {
          if (intervaloRef.current) clearInterval(intervaloRef.current);
          setEtapa("recusado");
        }
      } catch {
        // Falha de rede pontual — tenta de novo na próxima checagem
      }
    }, 4000);

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [etapa, pedidoId, limparCarrinho]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const novoPedidoId = crypto.randomUUID();

    // 1) Cria o pedido (ainda com pagamento pendente)
    const { error: erroPedido } = await supabase.from("pedidos").insert({
      id: novoPedidoId,
      cliente_nome: nome,
      cliente_telefone: telefone,
      tipo_entrega: tipoEntrega,
      endereco: tipoEntrega === "entrega" ? endereco : null,
      valor_total: totalPreco,
    });

    if (erroPedido) {
      setErro("Não foi possível registrar o pedido: " + erroPedido.message);
      setEnviando(false);
      return;
    }

    // 2) Cria os itens do pedido
    const itensParaSalvar = itens.map((item) => ({
      pedido_id: novoPedidoId,
      produto_id: item.id,
      produto_nome: item.nome,
      quantidade: item.quantidade,
      preco_unitario: item.preco,
    }));

    const { error: erroItens } = await supabase
      .from("itens_pedido")
      .insert(itensParaSalvar);

    if (erroItens) {
      setErro(
        "Pedido criado, mas houve um erro ao salvar os itens: " +
          erroItens.message
      );
      setEnviando(false);
      return;
    }

    // 3) Gera a cobrança Pix
    try {
      const resposta = await fetch("/api/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: novoPedidoId,
          valor: totalPreco,
          nome,
          email,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível gerar o Pix.");
        setEnviando(false);
        return;
      }

      setPedidoId(novoPedidoId);
      setQrCode(dados.qrCode);
      setQrCodeBase64(dados.qrCodeBase64);
      setEtapa("pagamento");
    } catch {
      setErro("Não foi possível conectar ao serviço de pagamento.");
    }

    setEnviando(false);
  }

  async function copiarCodigo() {
    if (!qrCode) return;
    await navigator.clipboard.writeText(qrCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  // --- Carrinho vazio (sem pedido em andamento) ---
  if (itens.length === 0 && etapa === "formulario") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-night px-6">
        <div className="text-center">
          <p className="text-cream/50">Seu carrinho está vazio.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-flame px-5 py-2 font-bold text-night"
          >
            Ver cardápio
          </Link>
        </div>
      </main>
    );
  }

  // --- Tela de pagamento Pix ---
  if (etapa === "pagamento") {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-night px-6 py-12">
        <div className="w-full max-w-sm rounded-lg border border-charline bg-nightSurface p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-mustard">
            pague com pix
          </p>
          <p className="mt-1 text-2xl font-bold text-flame">
            {formatarPreco(totalPreco)}
          </p>

          {qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code do Pix"
              className="mx-auto mt-4 h-52 w-52 rounded-md bg-white p-2"
            />
          )}

          <p className="mt-4 text-xs text-cream/50">
            Escaneie o QR Code com o app do seu banco, ou copie o código abaixo
          </p>

          <button
            onClick={copiarCodigo}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border-2 border-mustard px-4 py-2 text-sm font-bold text-mustard transition hover:bg-mustard hover:text-night"
          >
            {copiado ? <Check size={16} /> : <Copy size={16} />}
            {copiado ? "Código copiado!" : "Copiar código Pix"}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-cream/60">
            <span className="h-2 w-2 animate-pulse rounded-full bg-mustard" />
            Aguardando confirmação do pagamento...
          </div>
        </div>
      </main>
    );
  }

  // --- Pagamento recusado/expirado ---
  if (etapa === "recusado") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-night px-6">
        <div className="max-w-sm rounded-lg border-2 border-red-500/60 bg-nightSurface p-8 text-center">
          <p className="font-display text-3xl tracking-wide text-red-400">
            Pagamento não concluído
          </p>
          <p className="mt-2 text-sm text-cream/60">
            O Pix não foi aprovado ou expirou. Você pode tentar novamente.
          </p>
          <Link
            href="/carrinho"
            className="mt-6 inline-block rounded-md bg-flame px-5 py-2 font-bold text-night"
          >
            Voltar ao carrinho
          </Link>
        </div>
      </main>
    );
  }

  // --- Pedido pago com sucesso ---
  if (etapa === "concluido") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-night px-6">
        <div className="max-w-sm rounded-lg border-2 border-mustard bg-nightSurface p-8 text-center">
          <p className="font-display text-3xl tracking-wide text-mustard">
            Pagamento confirmado!
          </p>
          <p className="mt-2 text-sm text-cream/60">
            Seu pedido já está com a hamburgueria e logo entra em preparo 🔥
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-flame px-5 py-2 font-bold text-night"
          >
            Voltar ao cardápio
          </Link>
        </div>
      </main>
    );
  }

  // --- Formulário de checkout ---
  return (
    <main className="min-h-screen bg-night px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide text-cream">
          Finalizar pedido
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-cream/70">
                Nome
              </label>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 w-full rounded-md border border-charline bg-cream px-3 py-2 text-ink outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-cream/70">
                Telefone
              </label>
              <input
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="mt-1 w-full rounded-md border border-charline bg-cream px-3 py-2 text-ink outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-cream/70">
                E-mail (opcional, pra comprovante)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-charline bg-cream px-3 py-2 text-ink outline-none"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div>
              <span className="block text-sm font-bold text-cream/70">
                Como você quer receber?
              </span>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTipoEntrega("retirada")}
                  className={`flex-1 rounded-md border-2 px-3 py-2 text-sm font-bold transition ${
                    tipoEntrega === "retirada"
                      ? "border-flame bg-flame text-night"
                      : "border-charline bg-nightSurface text-cream/70"
                  }`}
                >
                  Retirar no balcão
                </button>
                <button
                  type="button"
                  onClick={() => setTipoEntrega("entrega")}
                  className={`flex-1 rounded-md border-2 px-3 py-2 text-sm font-bold transition ${
                    tipoEntrega === "entrega"
                      ? "border-flame bg-flame text-night"
                      : "border-charline bg-nightSurface text-cream/70"
                  }`}
                >
                  Entrega
                </button>
              </div>
            </div>

            {tipoEntrega === "entrega" && (
              <div>
                <label className="block text-sm font-bold text-cream/70">
                  Endereço de entrega
                </label>
                <input
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="mt-1 w-full rounded-md border border-charline bg-cream px-3 py-2 text-ink outline-none"
                  placeholder="Rua, número, bairro"
                />
              </div>
            )}

            {erro && (
              <p className="text-sm text-red-400" role="alert">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-md bg-flame px-4 py-3 font-bold text-night transition hover:opacity-90 disabled:opacity-60"
            >
              {enviando ? "Gerando Pix..." : "Ir para o pagamento"}
            </button>
          </form>

          <div className="h-fit rounded-lg border border-charline bg-nightSurface p-5">
            <h2 className="font-display text-xl tracking-wide text-cream">
              Resumo do pedido
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {itens.map((item) => (
                <li key={item.id} className="flex justify-between text-cream/60">
                  <span>
                    {item.quantidade}x {item.nome}
                  </span>
                  <span>{formatarPreco(item.preco * item.quantidade)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-charline pt-3 font-display text-xl tracking-wide text-cream">
              <span>Total</span>
              <span>{formatarPreco(totalPreco)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
