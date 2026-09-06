// Brasil não usa mais horário de verão desde 2019, então o deslocamento
// em relação ao UTC é sempre fixo: -3 horas.
const DESLOCAMENTO_BRASIL_MS = 3 * 60 * 60 * 1000;

// Calcula o início e o fim do dia de "hoje", considerando o horário de
// Brasília — não depende do fuso horário configurado no servidor
// (importante porque a Vercel roda em UTC por padrão).
export function intervaloDeHojeBrasil(referencia: Date = new Date()) {
  const comoSeFosseBrasil = new Date(
    referencia.getTime() - DESLOCAMENTO_BRASIL_MS
  );

  const ano = comoSeFosseBrasil.getUTCFullYear();
  const mes = comoSeFosseBrasil.getUTCMonth();
  const dia = comoSeFosseBrasil.getUTCDate();

  const inicio = new Date(
    Date.UTC(ano, mes, dia, 0, 0, 0) + DESLOCAMENTO_BRASIL_MS
  );
  const fim = new Date(
    Date.UTC(ano, mes, dia + 1, 0, 0, 0) + DESLOCAMENTO_BRASIL_MS
  );

  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}
