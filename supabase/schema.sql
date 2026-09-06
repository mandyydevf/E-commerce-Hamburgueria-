-- ============================================================
-- Script de configuração do banco de dados — Serve Bem Hamburgueria
-- Rode este arquivo inteiro no Supabase: SQL Editor > New query
-- ============================================================

-- 1) Tabela de produtos (itens do cardápio)
create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco numeric(10, 2) not null check (preco >= 0),
  categoria text,
  imagem_url text,
  disponivel boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table produtos enable row level security;

create policy "Qualquer pessoa pode ver os produtos"
  on produtos for select
  using (true);

create policy "Usuarios logados podem criar produtos"
  on produtos for insert
  to authenticated
  with check (true);

create policy "Usuarios logados podem editar produtos"
  on produtos for update
  to authenticated
  using (true);

create policy "Usuarios logados podem excluir produtos"
  on produtos for delete
  to authenticated
  using (true);


-- 2) Tabela de pedidos (cabeçalho do pedido feito pelo cliente)
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nome text not null,
  cliente_telefone text not null,
  tipo_entrega text not null check (tipo_entrega in ('retirada', 'entrega')),
  endereco text,
  status text not null default 'recebido'
    check (status in ('recebido', 'preparo', 'pronto', 'entregue')),
  valor_total numeric(10, 2) not null check (valor_total >= 0),
  mercado_pago_payment_id text,
  pagamento_status text not null default 'pendente'
    check (pagamento_status in ('pendente', 'aprovado', 'rejeitado', 'expirado')),
  criado_em timestamptz not null default now()
);

alter table pedidos enable row level security;

-- Qualquer cliente (sem precisar de login) pode CRIAR um pedido ao finalizar a compra.
create policy "Qualquer pessoa pode criar um pedido"
  on pedidos for insert
  to anon, authenticated
  with check (true);

-- Só o restaurante (logado) pode VER a lista de pedidos — protege dados dos clientes.
create policy "Usuarios logados podem ver os pedidos"
  on pedidos for select
  to authenticated
  using (true);

-- Só o restaurante (logado) pode ATUALIZAR o status do pedido.
create policy "Usuarios logados podem atualizar pedidos"
  on pedidos for update
  to authenticated
  using (true);


-- 3) Tabela de itens do pedido (quais produtos e quantidades, de cada pedido)
create table if not exists itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  produto_id uuid references produtos(id),
  produto_nome text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10, 2) not null check (preco_unitario >= 0)
);

alter table itens_pedido enable row level security;

create policy "Qualquer pessoa pode criar itens de pedido"
  on itens_pedido for insert
  to anon, authenticated
  with check (true);

create policy "Usuarios logados podem ver itens de pedido"
  on itens_pedido for select
  to authenticated
  using (true);


-- ============================================================
-- 4) Bucket de armazenamento para as fotos dos produtos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

create policy "Imagens de produtos sao publicas"
  on storage.objects for select
  using (bucket_id = 'produtos');

create policy "Usuarios logados podem enviar imagens"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produtos');

create policy "Usuarios logados podem apagar imagens"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produtos');
