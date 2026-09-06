"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  imagem_url: string | null;
  disponivel: boolean;
};

const PRODUTO_VAZIO = {
  nome: "",
  descricao: "",
  preco: "",
  categoria: "",
  disponivel: true,
  imagem: null as File | null,
};

export default function AdminProdutosClient({
  produtosIniciais,
}: {
  produtosIniciais: Produto[];
}) {
  const supabase = createClient();

  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(PRODUTO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function iniciarEdicao(produto: Produto) {
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome,
      descricao: produto.descricao ?? "",
      preco: String(produto.preco),
      categoria: produto.categoria ?? "",
      disponivel: produto.disponivel,
      imagem: null,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(PRODUTO_VAZIO);
    setErro(null);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    const precoNumerico = Number(form.preco.replace(",", "."));
    if (!form.nome.trim()) {
      setErro("O nome do produto é obrigatório.");
      return;
    }
    if (Number.isNaN(precoNumerico) || precoNumerico < 0) {
      setErro("Informe um preço válido (ex: 24.90).");
      return;
    }

    setSalvando(true);

    let imagemUrl: string | undefined;
    if (form.imagem) {
      const nomeArquivo = `${Date.now()}-${form.imagem.name}`;
      const { error: uploadError } = await supabase.storage
        .from("produtos")
        .upload(nomeArquivo, form.imagem);

      if (uploadError) {
        setErro("Não foi possível enviar a imagem: " + uploadError.message);
        setSalvando(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("produtos")
        .getPublicUrl(nomeArquivo);
      imagemUrl = publicUrlData.publicUrl;
    }

    const dadosComuns = {
      nome: form.nome,
      descricao: form.descricao || null,
      preco: precoNumerico,
      categoria: form.categoria || null,
      disponivel: form.disponivel,
    };

    if (editandoId) {
      const { data, error } = await supabase
        .from("produtos")
        .update({
          ...dadosComuns,
          ...(imagemUrl ? { imagem_url: imagemUrl } : {}),
        })
        .eq("id", editandoId)
        .select()
        .single();

      if (error) {
        setErro("Erro ao salvar alterações: " + error.message);
        setSalvando(false);
        return;
      }

      setProdutos((atuais) =>
        atuais.map((p) => (p.id === editandoId ? (data as Produto) : p))
      );
    } else {
      const { data, error } = await supabase
        .from("produtos")
        .insert({ ...dadosComuns, imagem_url: imagemUrl ?? null })
        .select()
        .single();

      if (error) {
        setErro("Erro ao cadastrar produto: " + error.message);
        setSalvando(false);
        return;
      }

      setProdutos((atuais) => [data as Produto, ...atuais]);
    }

    setSalvando(false);
    cancelarEdicao();
  }

  async function handleExcluir(id: string) {
    const confirmar = window.confirm("Excluir este item do cardápio?");
    if (!confirmar) return;

    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }
    setProdutos((atuais) => atuais.filter((p) => p.id !== id));
  }

  return (
    <main className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-widest text-flame">
          serve bem
        </p>
        <h1 className="mt-1 font-display text-4xl tracking-wide text-ink">
          Itens do cardápio
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr]">
        {/* Formulário */}
        <section>
          <h2 className="font-display text-2xl tracking-wide text-ink">
            {editandoId ? "Editar item" : "Novo item"}
          </h2>

          <form onSubmit={handleSalvar} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-bold text-ink/70">Nome</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="mt-1 w-full rounded-md border-2 border-paperLine/60 bg-white px-3 py-2 text-ink outline-none"
                placeholder="Ex: Cheddar Bacon"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink/70">
                Descrição (opcional)
              </label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="mt-1 w-full rounded-md border-2 border-paperLine/60 bg-white px-3 py-2 text-ink outline-none"
                rows={3}
                placeholder="Ex: Blend 180g, cheddar cremoso, bacon crocante"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink/70">
                Preço (R$)
              </label>
              <input
                required
                inputMode="decimal"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                className="mt-1 w-full rounded-md border-2 border-paperLine/60 bg-white px-3 py-2 text-ink outline-none"
                placeholder="Ex: 32.90"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink/70">
                Categoria (opcional)
              </label>
              <input
                list="categorias-sugeridas"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="mt-1 w-full rounded-md border-2 border-paperLine/60 bg-white px-3 py-2 text-ink outline-none"
                placeholder="Ex: Lanches, Bebidas..."
              />
              <datalist id="categorias-sugeridas">
                <option value="Lanches" />
                <option value="Acompanhamentos" />
                <option value="Bebidas" />
                <option value="Sobremesas" />
              </datalist>
            </div>

            <label className="flex items-center gap-2 text-sm font-bold text-ink/70">
              <input
                type="checkbox"
                checked={form.disponivel}
                onChange={(e) =>
                  setForm({ ...form, disponivel: e.target.checked })
                }
              />
              Disponível (desmarque se estiver esgotado)
            </label>

            <div>
              <label className="block text-sm font-bold text-ink/70">
                Foto {editandoId && "(deixe em branco pra manter a atual)"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, imagem: e.target.files?.[0] ?? null })
                }
                className="mt-1 w-full text-sm text-ink/70"
              />
            </div>

            {erro && (
              <p className="text-sm text-red-700" role="alert">
                {erro}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-md bg-flame px-4 py-2 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                  ? "Salvar alterações"
                  : "Cadastrar item"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="rounded-md border-2 border-paperLine/60 px-4 py-2 text-ink/70"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Lista */}
        <section>
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Cadastrados ({produtos.length})
          </h2>

          {produtos.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">
              Nenhum item cadastrado ainda. Use o formulário ao lado.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line/50">
              {produtos.map((produto) => (
                <li key={produto.id} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-paper/40">
                    {produto.imagem_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-ink">
                      {produto.nome}
                      {!produto.disponivel && (
                        <span className="ml-2 text-xs font-normal text-red-700">
                          (esgotado)
                        </span>
                      )}
                    </p>
                    <p className="text-sm font-bold text-flame">
                      {produto.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    {produto.categoria && (
                      <p className="text-xs text-ink/50">{produto.categoria}</p>
                    )}
                  </div>
                  <button
                    onClick={() => iniciarEdicao(produto)}
                    className="text-sm font-bold text-mustard underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(produto.id)}
                    className="text-sm font-bold text-red-700 underline"
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      </div>
    </main>
  );
}
