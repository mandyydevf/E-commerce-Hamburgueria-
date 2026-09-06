-- ============================================================
-- Migração — adiciona controle de pagamento Pix aos pedidos
-- Rode isto no Supabase: SQL Editor > New query
-- (confirma que está no projeto "serve-bem" antes de rodar)
-- ============================================================

alter table pedidos
  add column if not exists mercado_pago_payment_id text;

alter table pedidos
  add column if not exists pagamento_status text not null default 'pendente'
  check (pagamento_status in ('pendente', 'aprovado', 'rejeitado', 'expirado'));
