"use client";

import { useEffect, useState } from "react";
import { estaAberto, textoHorarioHoje } from "@/lib/horarioFuncionamento";

export default function StatusAberto() {
  const [aberto, setAberto] = useState<boolean | null>(null);

  useEffect(() => {
    function atualizar() {
      setAberto(estaAberto());
    }
    atualizar();
    const intervalo = setInterval(atualizar, 60_000);
    return () => clearInterval(intervalo);
  }, []);

  if (aberto === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        aberto ? "bg-mustard text-night" : "bg-white/10 text-cream/60"
      }`}
      title={textoHorarioHoje()}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          aberto ? "bg-night" : "bg-cream/40"
        }`}
      />
      {aberto ? "Aberto agora" : "Fechado agora"}
    </span>
  );
}
