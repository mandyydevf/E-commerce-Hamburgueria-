-- ============================================================
-- Migração — permite excluir um produto mesmo que ele já tenha
-- aparecido em pedidos antigos.
--
-- Hoje, excluir um produto que já foi vendido dá o erro:
-- "update or delete on table produtos violates foreign key
-- constraint itens_pedido_produto_id_fkey"
--
-- Isso acontece porque os itens de pedido guardam uma referência
-- pro produto original. A correção: quando o produto for excluído,
-- só desfaz essa referência (produto_id fica nulo) — o pedido
-- continua mostrando nome, tamanho, cor e preço normalmente, porque
-- esses dados já ficam salvos direto no item do pedido, sem depender
-- do produto ainda existir.
-- Rode isto no Supabase: SQL Editor > New query
-- ============================================================

alter table itens_pedido drop constraint if exists itens_pedido_produto_id_fkey;

alter table itens_pedido
  add constraint itens_pedido_produto_id_fkey
  foreign key (produto_id) references produtos(id) on delete set null;
