# Vero Store — Fase 2 (Banco de dados real)

Agora o projeto está conectado a um banco de dados de verdade (Supabase):
catálogo, carrinho, checkout e painel de pedidos gravando e lendo dados reais,
com login protegendo o painel.

**O que ainda falta pra próxima etapa:** pagamento Pix de verdade (por
enquanto o pedido é criado com status "Recebido" direto, sem cobrança) e
sistema de agenda de horários.

---

## Passo 1 — Criar um projeto novo no Supabase

Como você já tem conta no Supabase (a mesma usada na Korukoo), não precisa
criar conta de novo — só um **projeto novo**, já que cada negócio tem seu
próprio banco de dados separado.

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e faça login
2. Clique em **New Project**
3. Escolha a mesma organização de sempre (ou "Personal", se for o seu caso)
4. Dê um nome que identifique esse projeto, tipo `serve-bem` (pra não
   confundir com o projeto da Korukoo na lista)
5. Defina uma senha do banco (pode ser diferente da que você usou antes —
   guarde essa também) e a região mais próxima
6. Aguarde o projeto ficar pronto

## Passo 2 — Rodar o script do banco de dados

> ⚠️ Confirma no topo do painel do Supabase que está dentro do projeto
> **serve-bem** (não o da Korukoo) antes de continuar — como agora você tem
> mais de um projeto na mesma conta, é fácil mexer no lugar errado sem querer.

1. No Supabase, vá em **SQL Editor** → **New query**
2. Abra `supabase/schema.sql` deste projeto, copie tudo, cole no editor
3. Clique em **Run**

Isso cria as tabelas `produtos`, `pedidos`, `itens_pedido`, o bucket de
imagens, e todas as regras de segurança (RLS).

> Se der erro `relation "storage.buckets" does not exist`: visite a seção
> **Storage** no menu lateral do Supabase primeiro (isso inicializa o
> schema), depois rode o script de novo.

## Passo 3 — Criar o usuário do restaurante (login do painel)

1. No Supabase: **Authentication** → **Users** → **Add user** → **Create new user**
2. Preencha e-mail e senha forte
3. Marque a confirmação automática de e-mail

## Passo 4 — Pegar as chaves de API

1. **Project Settings** (engrenagem) → **API Keys**
2. Copie a **Project URL** (em Data API) e a chave **anon public** (ou
   **Publishable key**, dependendo da versão do painel)

⚠️ Nunca use a chave **service_role** no projeto — só a `anon public`.

## Passo 5 — Configurar o `.env.local`

Duplique `.env.local.example`, renomeie para `.env.local`, preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

## Passo 6 — Rodar localmente

```bash
npm install
npm run dev
```

Testa nessa ordem:
1. Abre `/admin/login`, entra com o usuário do Passo 3
2. Vai em `/admin/produtos` e cadastra algumas peças do catálogo (com foto)
3. Volta pra `/` (catálogo público) e confirma que os itens aparecem
4. Adiciona itens ao carrinho, vai em `/carrinho`, depois `/finalizar`
5. Preenche o formulário e confirma o pedido
6. Volta pro painel (`/admin/pedidos`) e confirma que o pedido apareceu
7. Testa o botão "Avançar" pra mudar o status do pedido

## Passo 7 — Subir pro GitHub

```bash
git init
git add .
git commit -m "Primeira versao com banco de dados"
git branch -M main
git remote add origin https://github.com/mandyydevf/E-commerce-Hamburgueria-.git
git push -u origin main
```

## Passo 8 — Publicar na Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → seleciona o repositório
2. Antes de clicar em Deploy, adiciona as variáveis de ambiente (mesmas do
   `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Clica em **Deploy**

Depois de publicado, testa o mesmo fluxo do Passo 6 na URL publicada.

---

## Resumo de segurança

- ✅ RLS ativado em todas as tabelas
- ✅ Clientes podem criar pedidos sem login, mas **não conseguem ler** a
  lista de pedidos de outras pessoas (só o restaurante logado consegue)
- ✅ Só usuário logado pode criar/editar/excluir produtos
- ✅ Painel protegido por middleware — sem login, redireciona pro `/admin/login`
- ✅ `.env.local` nunca vai pro Git

## Passo 10 — Configurar o pagamento via Pix (Mercado Pago)

### 10.1 — Criar conta e pegar as credenciais de teste

1. Acesse [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers/panel)
   e faça login (ou crie uma conta)
2. Vá em **Suas integrações** → crie uma aplicação (nome livre, tipo
   "Pagamentos online")
3. Dentro da aplicação, vá na aba **Credenciais de teste**
4. Copie o **Access Token de teste** (começa com `TEST-...`)

> Use as credenciais de **teste** primeiro. Com elas, nenhum dinheiro real
> é movimentado, mas o fluxo funciona de verdade (incluindo o QR Code).

### 10.2 — Pegar a chave "service_role" do Supabase

1. No Supabase, vá em **Project Settings** → **API Keys**
2. Procure a aba **Legacy API Keys** (ou similar)
3. Copie a chave **service_role**

⚠️ Essa chave dá acesso total ao banco, ignorando toda regra de segurança.
Trate com o mesmo cuidado de uma senha — nunca a compartilhe, nunca a
coloque em uma variável `NEXT_PUBLIC_`.

### 10.3 — Rodar a migração do banco

No SQL Editor do Supabase, roda o conteúdo de `supabase/migracao_pix.sql`.

### 10.4 — Preencher o `.env.local`

```
SUPABASE_SERVICE_ROLE_KEY=a-chave-que-voce-copiou
MERCADOPAGO_ACCESS_TOKEN=TEST-a-chave-de-teste-que-voce-copiou
SITE_URL=
```
(Pode deixar `SITE_URL` em branco por enquanto — só é necessária depois de
publicar, pra o webhook funcionar.)

### 10.5 — Testar localmente

```bash
npm install
npm run dev
```

Faz um pedido de teste até chegar na tela do Pix. O QR Code deve aparecer.
**A confirmação automática não vai acontecer localmente** (isso exige
que o Mercado Pago consiga acessar seu site pela internet) — mas você pode
confirmar manualmente que o pagamento foi criado entrando no painel do
Mercado Pago, em **Atividade**, e vendo o pagamento pendente lá.

### 10.6 — Depois de publicar na Vercel

1. Adicione as variáveis `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`
   e `SITE_URL` (agora com a URL real, tipo `https://serve-bem.vercel.app`)
   nas variáveis de ambiente da Vercel — marque `SUPABASE_SERVICE_ROLE_KEY`
   e `MERCADOPAGO_ACCESS_TOKEN` como **Secret** (não Config), já que são
   sensíveis
2. Faz um pedido de teste real no site publicado
3. Paga o Pix de teste (o Mercado Pago tem um app/simulador de pagamento
   de teste — consulte a documentação deles sobre "usuários de teste")
4. Confirma que o pedido aparece como pago automaticamente, sem precisar
   atualizar a página

### 10.7 — Indo pra produção (dinheiro de verdade)

Quando estiver tudo validado, troca o `MERCADOPAGO_ACCESS_TOKEN` pelo
**Access Token de produção** (também disponível no painel de
desenvolvedores do Mercado Pago) — tanto local quanto na Vercel.

## Próxima etapa

- Sistema de agenda de horários pra retirada/entrega

## Trocando o ícone do hero por uma foto real

Em `app/(loja)/page.tsx`, o hero usa um ícone ilustrado (SVG) no lugar de uma
foto, já que ainda não temos uma foto real da Vero Store. Quando o cliente
mandar uma foto (de uma peça ou do ambiente da loja):

1. Salve a imagem em `public/hero-loja.jpg` (ou `.png`)
2. No `app/(loja)/page.tsx`, troque todo o bloco `<svg>...</svg>` dentro do
   comentário "Elemento gráfico do hero" por:
   ```tsx
   <img
     src="/hero-loja.jpg"
     alt="Vero Store"
     className="h-full w-full rounded-full object-cover"
   />
   ```
