// Tamanhos padrão sugeridos no cadastro de produtos. Ajuste aqui se a loja
// usar outra grade (ex: numeração de calçado).
export const TAMANHOS_PADRAO = ["PP", "P", "M", "G", "GG", "XG"] as const;

// Cores sugeridas no cadastro — apenas sugestão (autocomplete), o lojista
// pode digitar qualquer cor.
export const CORES_SUGERIDAS = [
  "Preto",
  "Branco",
  "Cinza",
  "Bege",
  "Vermelho",
  "Azul",
  "Verde",
];

export type Variacao = {
  tamanho: string;
  cor: string;
  estoque: number;
};
