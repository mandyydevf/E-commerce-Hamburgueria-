"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Precisa bater exatamente com MOTIVOS_VALIDOS em
// app/api/cancelar-pedido/route.ts.
const MOTIVOS_CANCELAMENTO = [
  "Mudei de ideia",
  "Encontrei um preço melhor em outro lugar",
  "Coloquei os dados errados na compra",
  "Demorei demais pra decidir e não quero mais",
  "Outro motivo",
];

export default function CancelarPedido({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [detalhe, setDetalhe] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleCancelar() {
    if (!motivo) {
      setErro("Escolha um motivo pra continuar.");
      return;
    }
    setErro(null);
    setEnviando(true);

    try {
      const resposta = await fetch("/api/cancelar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId, motivo, detalhe }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível cancelar o pedido.");
        setEnviando(false);
        return;
      }

      router.refresh();
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
      setEnviando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-4 text-xs font-bold text-inkSoft underline hover:text-red-600"
      >
        Cancelar pedido
      </button>
    );
  }

  return (
    <div className="mt-4 border border-line p-4">
      <p className="text-sm font-bold text-ink">Por que você quer cancelar?</p>
      <div className="mt-2 space-y-1.5">
        {MOTIVOS_CANCELAMENTO.map((opcao) => (
          <label key={opcao} className="flex items-center gap-2 text-sm text-inkSoft">
            <input
              type="radio"
              name="motivo-cancelamento"
              value={opcao}
              checked={motivo === opcao}
              onChange={() => setMotivo(opcao)}
              className="accent-ink"
            />
            {opcao}
          </label>
        ))}
      </div>

      {motivo === "Outro motivo" && (
        <textarea
          value={detalhe}
          onChange={(e) => setDetalhe(e.target.value)}
          placeholder="Conte um pouco mais (opcional)"
          rows={2}
          maxLength={300}
          className="mt-2 w-full border border-line bg-bg px-2 py-1.5 text-sm text-ink outline-none"
        />
      )}

      {erro && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {erro}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleCancelar}
          disabled={enviando}
          className="bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {enviando ? "Cancelando..." : "Confirmar cancelamento"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          disabled={enviando}
          className="border border-line px-4 py-2 text-xs font-bold text-inkSoft"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
