-- ============================================================
-- Migração — adiciona variações de tamanho + cor com estoque
-- próprio, e preço promocional (preço antigo riscado + desconto).
-- Rode isto no Supabase: SQL Editor > New query
-- ============================================================

-- 1) Preço "de/por": quando preenchido, a loja mostra o preço antigo
--    riscado e o desconto em cima do preço atual (preco).
alter table produtos
  add column if not exists preco_antigo numeric(10, 2);

alter table produtos drop constraint if exists produtos_preco_antigo_check;

alter table produtos
  add constraint produtos_preco_antigo_check
  check (preco_antigo is null or preco_antigo > preco);

-- 2) Tabela de variações por produto: cada combinação de tamanho + cor
--    tem seu próprio estoque (ex: Preto/M tem 3, Preto/G tem 0).
create table if not exists produto_variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  tamanho text not null,
  cor text not null,
  estoque integer not null default 0 check (estoque >= 0),
  unique (produto_id, tamanho, cor)
);

alter table produto_variacoes enable row level security;

drop policy if exists "Qualquer pessoa pode ver as variacoes" on produto_variacoes;
create policy "Qualquer pessoa pode ver as variacoes"
  on produto_variacoes for select
  using (true);

drop policy if exists "Usuarios logados podem criar variacoes" on produto_variacoes;
create policy "Usuarios logados podem criar variacoes"
  on produto_variacoes for insert
  to authenticated
  with check (true);

drop policy if exists "Usuarios logados podem editar variacoes" on produto_variacoes;
create policy "Usuarios logados podem editar variacoes"
  on produto_variacoes for update
  to authenticated
  using (true);

drop policy if exists "Usuarios logados podem excluir variacoes" on produto_variacoes;
create policy "Usuarios logados podem excluir variacoes"
  on produto_variacoes for delete
  to authenticated
  using (true);

-- 3) Se a tabela antiga só-de-tamanho já existia (versão anterior desta
--    migração), aproveita os dados e depois remove ela.
do $$
begin
  if to_regclass('public.produto_tamanhos') is not null then
    insert into produto_variacoes (produto_id, tamanho, cor, estoque)
    select produto_id, tamanho, 'Único', estoque from produto_tamanhos
    on conflict (produto_id, tamanho, cor) do nothing;

    drop table produto_tamanhos;
  end if;
end $$;

-- 4) Guarda qual tamanho e cor o cliente escolheu, em cada item de pedido
alter table itens_pedido
  add column if not exists tamanho text;

alter table itens_pedido
  add column if not exists cor text;
