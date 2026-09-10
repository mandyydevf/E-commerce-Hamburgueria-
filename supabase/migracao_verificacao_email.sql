-- ============================================================
-- Migração — troca a busca de pedidos por telefone (sem
-- verificação) por busca por e-mail com código de confirmação.
-- Rode isto no Supabase: SQL Editor > New query
-- ============================================================

-- 1) Guarda o e-mail do cliente no pedido (agora obrigatório no checkout)
alter table pedidos
  add column if not exists cliente_email text;

-- 2) Tabela de códigos de verificação — só o servidor mexe aqui (chave
-- service_role), por isso RLS fica ligado sem nenhuma policy: ninguém
-- via navegador (anon/authenticated) consegue ler ou escrever direto.
create table if not exists codigos_verificacao (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  codigo text not null,
  expira_em timestamptz not null,
  usado boolean not null default false,
  criado_em timestamptz not null default now()
);

alter table codigos_verificacao enable row level security;

create index if not exists codigos_verificacao_email_idx on codigos_verificacao (email);
