import { createClient } from "@supabase/supabase-js";

// ⚠️ ATENÇÃO: este cliente usa a chave "service_role", que ignora TODAS
// as regras de segurança (RLS) do banco. Ele é necessário aqui porque a
// confirmação de pagamento (webhook do Mercado Pago) não é feita por um
// usuário logado — é o próprio servidor atualizando o pedido.
//
// REGRA DE OURO: nunca importe este arquivo em um componente "use client"
// ou em qualquer lugar que rode no navegador. Use apenas dentro de
// Route Handlers (arquivos app/api/.../route.ts), que rodam só no servidor.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
