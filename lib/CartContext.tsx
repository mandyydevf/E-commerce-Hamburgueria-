"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ItemCarrinho = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
};

type CarrinhoContexto = {
  itens: ItemCarrinho[];
  adicionarItem: (produto: { id: string; nome: string; preco: number }) => void;
  removerItem: (id: string) => void;
  alterarQuantidade: (id: string, quantidade: number) => void;
  limparCarrinho: () => void;
  totalItens: number;
  totalPreco: number;
};

const CarrinhoContext = createContext<CarrinhoContexto | undefined>(undefined);

const CHAVE_ARMAZENAMENTO = "serve-bem:carrinho";

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

  function adicionarItem(produto: { id: string; nome: string; preco: number }) {
    setItens((atuais) => {
      const existente = atuais.find((i) => i.id === produto.id);
      if (existente) {
        return atuais.map((i) =>
          i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...atuais, { ...produto, quantidade: 1 }];
    });
  }

  function removerItem(id: string) {
    setItens((atuais) => atuais.filter((i) => i.id !== id));
  }

  function alterarQuantidade(id: string, quantidade: number) {
    if (quantidade <= 0) {
      removerItem(id);
      return;
    }
    setItens((atuais) =>
      atuais.map((i) => (i.id === id ? { ...i, quantidade } : i))
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
