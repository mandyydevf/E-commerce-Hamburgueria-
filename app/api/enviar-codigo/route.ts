import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { enviarEmail } from "@/lib/email";

const VALIDADE_MINUTOS = 10;
const INTERVALO_MINIMO_SEGUNDOS = 60;

function gerarCodigo() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  // Evita mandar vários códigos seguidos pro mesmo e-mail
  const { data: recente } = await supabaseAdmin
    .from("codigos_verificacao")
    .select("criado_em")
    .eq("email", email)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recente) {
    const segundosDesde = (Date.now() - new Date(recente.criado_em).getTime()) / 1000;
    if (segundosDesde < INTERVALO_MINIMO_SEGUNDOS) {
      return NextResponse.json(
        { error: "Aguarde um minuto antes de pedir um novo código." },
        { status: 429 }
      );
    }
  }

  const codigo = gerarCodigo();
  const expiraEm = new Date(Date.now() + VALIDADE_MINUTOS * 60_000).toISOString();

  const { error: erroInsert } = await supabaseAdmin
    .from("codigos_verificacao")
    .insert({ email, codigo, expira_em: expiraEm });

  if (erroInsert) {
    return NextResponse.json({ error: "Não foi possível gerar o código." }, { status: 500 });
  }

  try {
    await enviarEmail({
      para: email,
      assunto: `Seu código de verificação: ${codigo}`,
      html: `
        <p>Use o código abaixo pra ver seus pedidos na Vero Store:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${codigo}</p>
        <p>Esse código vale por ${VALIDADE_MINUTOS} minutos. Se você não pediu isso, pode ignorar este e-mail.</p>
      `,
    });
  } catch (erro) {
    console.error("Erro ao enviar e-mail de verificação:", erro);
    return NextResponse.json(
      { error: "Não foi possível enviar o e-mail agora. Tente de novo em instantes." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
