import type { Sorteio } from "./aleatorio";
import { ehLetra, letraBase } from "./letras";
import type { Nivel } from "./niveis";
import type { PalavraDaRodada } from "./palavras";

export const NOMES_DOS_RIVAIS = ["Bia", "Caio", "Duda", "Enzo", "Fabi"] as const;

export type Rival = {
    nome: string;
    habilidade: number;
};

export type DesempenhoSimulado = {
    acertou: boolean;
    erros: number;
    segundosGastos: number;
};

export function criarRivais(sorteio: Sorteio): Rival[] {
    return NOMES_DOS_RIVAIS.map((nome) => ({ nome, habilidade: 0.35 + sorteio() * 0.55 }));
}

export function simularRodada(rival: Rival, palavra: PalavraDaRodada, nivel: Nivel, sorteio: Sorteio): DesempenhoSimulado {
    const letrasParaAchar = new Set([...palavra.texto].filter(ehLetra).map(letraBase)).size;
    const chanceDeAcertar = 0.25 + 0.55 * rival.habilidade;
    let acertos = 0;
    let erros = 0;
    let segundos = 0;

    while (acertos < letrasParaAchar && erros < nivel.vidas) {
        segundos += 1.5 + sorteio() * (6 - 4 * rival.habilidade);
        if (segundos >= nivel.segundos) {
            return { acertou: false, erros, segundosGastos: nivel.segundos };
        }
        if (sorteio() < chanceDeAcertar) {
            acertos += 1;
        } else {
            erros += 1;
        }
    }

    return { acertou: acertos === letrasParaAchar, erros, segundosGastos: Math.ceil(segundos) };
}
