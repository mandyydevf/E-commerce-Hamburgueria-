-- ============================================================
-- Script de configuração do banco de dados — Vero Store
-- Rode este arquivo inteiro no Supabase: SQL Editor > New query
-- ============================================================

-- 1) Tabela de produtos (itens do catálogo)
create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco numeric(10, 2) not null check (preco >= 0),
  -- Preço "de" (antigo), opcional — quando preenchido e maior que o preço
  -- atual, a loja mostra riscado + o desconto (ex: promoção).
  preco_antigo numeric(10, 2) check (preco_antigo is null or preco_antigo > preco),
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


-- 1.1) Variações de cada produto (tamanho + cor), com estoque individual
-- de cada combinação (ex: Preto/M tem 3, Preto/G tem 0)
create table if not exists produto_variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  tamanho text not null,
  cor text not null,
  estoque integer not null default 0 check (estoque >= 0),
  unique (produto_id, tamanho, cor)
);

alter table produto_variacoes enable row level security;

create policy "Qualquer pessoa pode ver as variacoes"
  on produto_variacoes for select
  using (true);

create policy "Usuarios logados podem criar variacoes"
  on produto_variacoes for insert
  to authenticated
  with check (true);

create policy "Usuarios logados podem editar variacoes"
  on produto_variacoes for update
  to authenticated
  using (true);

create policy "Usuarios logados podem excluir variacoes"
  on produto_variacoes for delete
  to authenticated
  using (true);


-- 2) Tabela de pedidos (cabeçalho do pedido feito pelo cliente)
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nome text not null,
  cliente_telefone text not null,
  cliente_email text,
  tipo_entrega text not null check (tipo_entrega in ('retirada', 'entrega')),
  endereco text,
  status text not null default 'separacao'
    check (status in ('separacao', 'enviado', 'entregue', 'cancelado')),
  valor_total numeric(10, 2) not null check (valor_total >= 0),
  mercado_pago_payment_id text,
  pagamento_status text not null default 'pendente'
    check (pagamento_status in ('pendente', 'aprovado', 'rejeitado', 'expirado')),
  codigo_rastreio text,
  transportadora text,
  motivo_cancelamento text,
  cancelado_por text check (cancelado_por is null or cancelado_por in ('cliente', 'loja')),
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
  produto_id uuid references produtos(id) on delete set null,
  produto_nome text not null,
  tamanho text,
  cor text,
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


-- 3.1) Códigos de verificação por e-mail (pra loja em /meus-pedidos).
-- Só o servidor mexe aqui (chave service_role) — RLS ligado sem
-- nenhuma policy, então ninguém consegue ler/escrever via navegador.
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
