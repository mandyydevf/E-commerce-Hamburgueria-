// Envio de e-mail via API do Resend (https://resend.com). Usa fetch puro
// pra não precisar adicionar mais uma dependência ao projeto.
//
// ⚠️ Só chame isto a partir de código que roda no servidor (Route
// Handlers) — nunca em um componente "use client".
export async function enviarEmail({
  para,
  assunto,
  html,
}: {
  para: string;
  assunto: string;
  html: string;
}) {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chave}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Domínio de teste do Resend — funciona sem precisar verificar um
      // domínio próprio. Troque por um e-mail do seu domínio quando tiver
      // um (ex: "Vero Store <pedidos@verostore.com>").
      from: "Vero Store <onboarding@resend.dev>",
      to: [para],
      subject: assunto,
      html,
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(`Falha ao enviar e-mail (${resposta.status}): ${detalhe}`);
  }
}
