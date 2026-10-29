import type { CodigoNivel } from "./niveis";

export type PalavraDaRodada = {
    texto: string;
    categoria: string;
    nivel: CodigoNivel;
};

export const PALAVRAS_FIXAS: readonly PalavraDaRodada[] = [
    { texto: "MAÇÃ", categoria: "Comida", nivel: "facil" },
    { texto: "ABACAXI", categoria: "Comida", nivel: "medio" },
    { texto: "PÃO DE QUEIJO", categoria: "Comida", nivel: "dificil" },
];
