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
      className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-inkSoft sm:inline-flex"
      title={textoHorarioHoje()}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${aberto ? "bg-green-600" : "bg-inkSoft/40"}`}
      />
      {aberto ? "Aberto agora" : "Fechado agora"}
    </span>
  );
}
