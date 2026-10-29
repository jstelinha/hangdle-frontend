export type CodigoNivel = "facil" | "medio" | "dificil";

export type Nivel = {
    codigo: CodigoNivel;
    nome: string;
    vidas: number;
    segundos: number;
    multiplicador: number;
};

export const NIVEIS: Record<CodigoNivel, Nivel> = {
    facil: { codigo: "facil", nome: "Fácil", vidas: 8, segundos: 120, multiplicador: 1 },
    medio: { codigo: "medio", nome: "Médio", vidas: 6, segundos: 90, multiplicador: 1.5 },
    dificil: { codigo: "dificil", nome: "Difícil", vidas: 4, segundos: 45, multiplicador: 2 },
};
