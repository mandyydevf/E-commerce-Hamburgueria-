import { createBrowserClient } from "@supabase/ssr";

// Chave "anon" (pública) — segura porque as regras de RLS do banco
// controlam o que pode ser feito com ela (ver supabase/schema.sql).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
