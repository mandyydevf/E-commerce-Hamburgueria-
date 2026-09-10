"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { TAMANHOS_PADRAO, CORES_SUGERIDAS, type Variacao } from "@/lib/tamanhos";

type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  preco_antigo: number | null;
  categoria: string | null;
  imagem_url: string | null;
  disponivel: boolean;
  produto_variacoes: Variacao[];
};

type LinhaVariacao = { tamanho: string; cor: string; estoque: string };

const PRODUTO_VAZIO = {
  nome: "",
  descricao: "",
  preco: "",
  precoAntigo: "",
  categoria: "",
  disponivel: true,
  imagem: null as File | null,
  variacoes: [] as LinhaVariacao[],
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
      precoAntigo: produto.preco_antigo ? String(produto.preco_antigo) : "",
      categoria: produto.categoria ?? "",
      disponivel: produto.disponivel,
      imagem: null,
      variacoes: produto.produto_variacoes.map((v) => ({
        tamanho: v.tamanho,
        cor: v.cor,
        estoque: String(v.estoque),
      })),
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(PRODUTO_VAZIO);
    setErro(null);
  }

  function adicionarVariacao() {
    setForm({
      ...form,
      variacoes: [...form.variacoes, { tamanho: "", cor: "", estoque: "" }],
    });
  }

  function removerVariacao(indice: number) {
    setForm({
      ...form,
      variacoes: form.variacoes.filter((_, i) => i !== indice),
    });
  }

  function atualizarVariacao(indice: number, campo: keyof LinhaVariacao, valor: string) {
    setForm({
      ...form,
      variacoes: form.variacoes.map((v, i) => (i === indice ? { ...v, [campo]: valor } : v)),
    });
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
      setErro("Informe um preço válido (ex: 189.90).");
      return;
    }

    let precoAntigoNumerico: number | null = null;
    if (form.precoAntigo.trim()) {
      precoAntigoNumerico = Number(form.precoAntigo.replace(",", "."));
      if (Number.isNaN(precoAntigoNumerico) || precoAntigoNumerico <= precoNumerico) {
        setErro("O preço antigo precisa ser maior que o preço atual.");
        return;
      }
    }

    const variacoesIncompletas = form.variacoes.some(
      (v) => (v.tamanho.trim() === "") !== (v.cor.trim() === "")
    );
    if (variacoesIncompletas) {
      setErro("Preencha tamanho e cor de cada variação (ou apague a linha).");
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
      preco_antigo: precoAntigoNumerico,
      categoria: form.categoria || null,
      disponivel: form.disponivel,
    };

    let produtoId = editandoId;

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
      produtoId = data.id;
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
      produtoId = data.id;
    }

    // Só considera as linhas com tamanho e cor preenchidos. Se não sobrar
    // nenhuma, o item vira "tamanho único" (sem seletor na loja).
    const variacoesParaSalvar: Variacao[] = form.variacoes
      .filter((v) => v.tamanho.trim() !== "" && v.cor.trim() !== "")
      .map((v) => ({
        tamanho: v.tamanho.trim(),
        cor: v.cor.trim(),
        estoque: Math.max(0, Number(v.estoque) || 0),
      }));

    // Substitui as variações desse produto do zero, pra refletir exatamente
    // o que ficou no formulário (inclusive remover as que o lojista apagou).
    const { error: erroLimparVariacoes } = await supabase
      .from("produto_variacoes")
      .delete()
      .eq("produto_id", produtoId);

    if (erroLimparVariacoes) {
      setErro("Produto salvo, mas houve um erro ao atualizar as variações: " + erroLimparVariacoes.message);
      setSalvando(false);
      return;
    }

    if (variacoesParaSalvar.length > 0) {
      const { error: erroVariacoes } = await supabase
        .from("produto_variacoes")
        .insert(variacoesParaSalvar.map((v) => ({ produto_id: produtoId, ...v })));

      if (erroVariacoes) {
        setErro("Produto salvo, mas houve um erro ao salvar as variações: " + erroVariacoes.message);
        setSalvando(false);
        return;
      }
    }

    const { data: produtoAtualizado } = await supabase
      .from("produtos")
      .select(
        "id, nome, descricao, preco, preco_antigo, categoria, imagem_url, disponivel, produto_variacoes(tamanho, cor, estoque)"
      )
      .eq("id", produtoId)
      .single();

    if (produtoAtualizado) {
      setProdutos((atuais) => {
        const semEsse = atuais.filter((p) => p.id !== produtoId);
        return editandoId
          ? atuais.map((p) => (p.id === produtoId ? (produtoAtualizado as Produto) : p))
          : [produtoAtualizado as Produto, ...semEsse];
      });
    }

    setSalvando(false);
    cancelarEdicao();
  }

  async function handleExcluir(id: string) {
    const confirmar = window.confirm("Excluir este item do catálogo?");
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
        <p className="text-sm font-bold uppercase tracking-widest text-accent">
          vero store
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
          Itens do catálogo
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr]">
        {/* Formulário */}
        <section>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">
            {editandoId ? "Editar item" : "Novo item"}
          </h2>

          <form onSubmit={handleSalvar} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-bold text-ink/70">Nome</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="mt-1 w-full border border-line bg-bg px-3 py-2 text-ink outline-none"
                placeholder="Ex: Camiseta Oversized"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink/70">
                Descrição (opcional)
              </label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="mt-1 w-full border border-line bg-bg px-3 py-2 text-ink outline-none"
                rows={3}
                placeholder="Ex: 100% algodão, estampa exclusiva"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-ink/70">
                  Preço (R$)
                </label>
                <input
                  required
                  inputMode="decimal"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  className="mt-1 w-full border border-line bg-bg px-3 py-2 text-ink outline-none"
                  placeholder="Ex: 129.90"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink/70">
                  Preço antigo (opcional)
                </label>
                <input
                  inputMode="decimal"
                  value={form.precoAntigo}
                  onChange={(e) => setForm({ ...form, precoAntigo: e.target.value })}
                  className="mt-1 w-full border border-line bg-bg px-3 py-2 text-ink outline-none"
                  placeholder="Ex: 179.90"
                />
                <p className="mt-1 text-xs text-ink/40">
                  Preenche pra mostrar riscado + % OFF na loja
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink/70">
                Categoria (opcional)
              </label>
              <input
                list="categorias-sugeridas"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="mt-1 w-full border border-line bg-bg px-3 py-2 text-ink outline-none"
                placeholder="Ex: Camisetas, Moletons..."
              />
              <datalist id="categorias-sugeridas">
                <option value="Camisetas" />
                <option value="Moletons" />
                <option value="Calças" />
                <option value="Acessórios" />
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink/70">
                Variações (tamanho + cor)
              </label>

              {form.variacoes.length > 0 && (
                <div className="mt-2 space-y-2">
                  {form.variacoes.map((v, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <select
                        value={v.tamanho}
                        onChange={(e) => atualizarVariacao(i, "tamanho", e.target.value)}
                        className="border border-line bg-bg px-2 py-1.5 text-sm text-ink outline-none"
                      >
                        <option value="">Tam.</option>
                        {TAMANHOS_PADRAO.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <input
                        list="cores-sugeridas"
                        value={v.cor}
                        onChange={(e) => atualizarVariacao(i, "cor", e.target.value)}
                        placeholder="Cor"
                        className="min-w-0 flex-1 border border-line bg-bg px-2 py-1.5 text-sm text-ink outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        value={v.estoque}
                        onChange={(e) => atualizarVariacao(i, "estoque", e.target.value)}
                        placeholder="Estoque"
                        className="w-16 border border-line bg-bg px-2 py-1.5 text-center text-sm text-ink outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removerVariacao(i)}
                        className="flex-shrink-0 text-ink/40 hover:text-red-700"
                        aria-label="Remover variação"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <datalist id="cores-sugeridas">
                    {CORES_SUGERIDAS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              )}

              <button
                type="button"
                onClick={adicionarVariacao}
                className="mt-2 flex items-center gap-1 text-xs font-bold text-accent"
              >
                <Plus size={14} /> Adicionar variação
              </button>
              <p className="mt-1 text-xs text-ink/40">
                Cada linha é uma combinação tamanho + cor, com estoque
                próprio. Estoque 0 aparece riscado na loja. Sem nenhuma
                variação, o item vira "tamanho único".
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm font-bold text-ink/70">
              <input
                type="checkbox"
                checked={form.disponivel}
                onChange={(e) =>
                  setForm({ ...form, disponivel: e.target.checked })
                }
              />
              Disponível (desmarque pra tirar o item da loja)
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
                className="bg-ink px-4 py-2 text-sm font-bold uppercase tracking-wide text-bg transition hover:opacity-90 disabled:opacity-60"
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
                  className="border border-line px-4 py-2 text-sm font-bold text-ink/70"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Lista */}
        <section>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">
            Cadastrados ({produtos.length})
          </h2>

          {produtos.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">
              Nenhum item cadastrado ainda. Use o formulário ao lado.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {produtos.map((produto) => {
                const estoqueTotal = produto.produto_variacoes.reduce(
                  (soma, v) => soma + v.estoque,
                  0
                );
                return (
                  <li key={produto.id} className="flex items-center gap-4 py-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-surface">
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
                            (inativo)
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-bold text-accent">
                        {produto.preco_antigo && (
                          <span className="mr-1 font-normal text-ink/40 line-through">
                            {produto.preco_antigo.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        )}
                        {produto.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <p className="text-xs text-ink/50">
                        {produto.categoria && `${produto.categoria} · `}
                        {produto.produto_variacoes.length > 0
                          ? `${estoqueTotal} peça(s) em estoque`
                          : "tamanho único"}
                      </p>
                    </div>
                    <button
                      onClick={() => iniciarEdicao(produto)}
                      className="text-sm font-bold text-accent underline"
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
                );
              })}
            </ul>
          )}
        </section>
      </div>
      </div>
    </main>
  );
}
