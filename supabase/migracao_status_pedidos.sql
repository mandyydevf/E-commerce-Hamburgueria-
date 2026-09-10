-- ============================================================
-- Migração — atualiza os status de pedido para o padrão de
-- e-commerce de moda (separação → enviado → entregue/cancelado)
-- e adiciona código de rastreio.
-- Rode isto no Supabase: SQL Editor > New query
-- (confirma que está no projeto certo antes de rodar)
-- ============================================================

-- 1) Solta a regra de validação antiga primeiro — ela só aceitava
--    'recebido'/'preparo'/'pronto'/'entregue', então os updates do
--    próximo passo seriam rejeitados se ela continuasse ativa.
alter table pedidos drop constraint if exists pedidos_status_check;

-- 2) Traduz os status antigos (fluxo de lanchonete) pros novos
update pedidos set status = 'separacao' where status in ('recebido', 'preparo');
update pedidos set status = 'enviado' where status = 'pronto';
-- 'entregue' já existia e continua com o mesmo nome.

-- 3) Cria a regra de validação nova e troca o valor padrão
alter table pedidos
  alter column status set default 'separacao';

alter table pedidos
  add constraint pedidos_status_check
  check (status in ('separacao', 'enviado', 'entregue', 'cancelado'));

-- 4) Campos novos pra acompanhar o envio
alter table pedidos
  add column if not exists codigo_rastreio text;

alter table pedidos
  add column if not exists transportadora text;
