"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ItemCarrinho = {
  // Identifica a linha do carrinho — mesmo produto em tamanho/cor
  // diferentes vira linhas separadas, por isso a chave junta os três.
  chave: string;
  produtoId: string;
  nome: string;
  preco: number;
  tamanho: string | null;
  cor: string | null;
  quantidade: number;
};

function chaveDoItem(produtoId: string, tamanho: string | null, cor: string | null) {
  return `${produtoId}::${tamanho ?? "-"}::${cor ?? "-"}`;
}

type CarrinhoContexto = {
  itens: ItemCarrinho[];
  adicionarItem: (produto: {
    id: string;
    nome: string;
    preco: number;
    tamanho: string | null;
    cor: string | null;
  }) => void;
  removerItem: (chave: string) => void;
  alterarQuantidade: (chave: string, quantidade: number) => void;
  limparCarrinho: () => void;
  totalItens: number;
  totalPreco: number;
};

const CarrinhoContext = createContext<CarrinhoContexto | undefined>(undefined);

const CHAVE_ARMAZENAMENTO = "vero-store:carrinho:v3";

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carregado, setCarregado] = useState(false);

  // Carrega o carrinho salvo no navegador ao abrir o site
  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {
      // Se der erro ao ler, começa com carrinho vazio mesmo
    } finally {
      setCarregado(true);
    }
  }, []);

  // Salva no navegador toda vez que o carrinho mudar
  useEffect(() => {
    if (!carregado) return;
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(itens));
  }, [itens, carregado]);

  function adicionarItem(produto: {
    id: string;
    nome: string;
    preco: number;
    tamanho: string | null;
    cor: string | null;
  }) {
    const chave = chaveDoItem(produto.id, produto.tamanho, produto.cor);
    setItens((atuais) => {
      const existente = atuais.find((i) => i.chave === chave);
      if (existente) {
        return atuais.map((i) =>
          i.chave === chave ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [
        ...atuais,
        {
          chave,
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          tamanho: produto.tamanho,
          cor: produto.cor,
          quantidade: 1,
        },
      ];
    });
  }

  function removerItem(chave: string) {
    setItens((atuais) => atuais.filter((i) => i.chave !== chave));
  }

  function alterarQuantidade(chave: string, quantidade: number) {
    if (quantidade <= 0) {
      removerItem(chave);
      return;
    }
    setItens((atuais) =>
      atuais.map((i) => (i.chave === chave ? { ...i, quantidade } : i))
    );
  }

  function limparCarrinho() {
    setItens([]);
  }

  const totalItens = itens.reduce((soma, i) => soma + i.quantidade, 0);
  const totalPreco = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        alterarQuantidade,
        limparCarrinho,
        totalItens,
        totalPreco,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);
  if (!contexto) {
    throw new Error("useCarrinho precisa ser usado dentro de CarrinhoProvider");
  }
  return contexto;
}
