-- ============================================================
-- Migração — permite o cliente cancelar o próprio pedido (com
-- motivo) pela página de acompanhamento, antes de ser enviado.
-- Rode isto no Supabase: SQL Editor > New query
-- ============================================================

alter table pedidos
  add column if not exists motivo_cancelamento text;

alter table pedidos
  add column if not exists cancelado_por text;

alter table pedidos drop constraint if exists pedidos_cancelado_por_check;

alter table pedidos
  add constraint pedidos_cancelado_por_check
  check (cancelado_por is null or cancelado_por in ('cliente', 'loja'));
