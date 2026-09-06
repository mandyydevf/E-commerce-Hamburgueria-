// Horário de funcionamento — ajuste esses valores conforme o funcionamento
// real da hamburgueria. No futuro isso pode virar uma tela editável no painel.
// Índices: 0 = domingo, 1 = segunda, ... 6 = sábado. "null" = fechado no dia.
type HorarioDoDia = { abre: string; fecha: string } | null;

export const horarioFuncionamento: Record<number, HorarioDoDia> = {
  0: { abre: "18:00", fecha: "23:30" }, // domingo
  1: { abre: "18:00", fecha: "23:30" }, // segunda
  2: null, // terça — fechado
  3: { abre: "18:00", fecha: "23:30" }, // quarta
  4: { abre: "18:00", fecha: "23:30" }, // quinta
  5: { abre: "18:00", fecha: "23:59" }, // sexta
  6: { abre: "18:00", fecha: "23:59" }, // sábado
};

export function estaAberto(agora: Date = new Date()): boolean {
  const horarioHoje = horarioFuncionamento[agora.getDay()];
  if (!horarioHoje) return false;

  const [horaAbre, minAbre] = horarioHoje.abre.split(":").map(Number);
  const [horaFecha, minFecha] = horarioHoje.fecha.split(":").map(Number);

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const minutosAbre = horaAbre * 60 + minAbre;
  const minutosFecha = horaFecha * 60 + minFecha;

  return minutosAgora >= minutosAbre && minutosAgora <= minutosFecha;
}

export function textoHorarioHoje(agora: Date = new Date()): string {
  const horarioHoje = horarioFuncionamento[agora.getDay()];
  if (!horarioHoje) return "Fechado hoje";
  return `Hoje: ${horarioHoje.abre} às ${horarioHoje.fecha}`;
}
