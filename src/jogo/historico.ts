import type { ResultadoDiario } from "../types/jogo";
import { media } from "./estatistica";
import { diaAnterior } from "./relogioDoDia";

export type ResumoDoHistorico = {
    partidas: number;
    acertos: number;
    taxaDeAcerto: number;
    sequenciaAtual: number;
    melhorSequencia: number;
    mediaDeLetras: number | null;
};

export function sequenciaAtual(resultados: ResultadoDiario[], hoje: string): number {
    const acertouNoDia = new Map(resultados.map((resultado) => [resultado.dia, resultado.acertou]));
    let dia = acertouNoDia.has(hoje) ? hoje : diaAnterior(hoje);
    let sequencia = 0;
    while (acertouNoDia.get(dia) === true) {
        sequencia += 1;
        dia = diaAnterior(dia);
    }
    return sequencia;
}

export function melhorSequencia(resultados: ResultadoDiario[]): number {
    const diasAcertados = resultados
        .filter((resultado) => resultado.acertou)
        .map((resultado) => resultado.dia)
        .sort();
    let melhor = 0;
    let atual = 0;
    let anterior: string | null = null;
    for (const dia of diasAcertados) {
        atual = anterior !== null && diaAnterior(dia) === anterior ? atual + 1 : 1;
        melhor = Math.max(melhor, atual);
        anterior = dia;
    }
    return melhor;
}

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Desenvolver métricas adequadas aos objetivos de negócio
export function resumirHistorico(resultados: ResultadoDiario[], hoje: string): ResumoDoHistorico {
    const acertadas = resultados.filter((resultado) => resultado.acertou);
    return {
        partidas: resultados.length,
        acertos: acertadas.length,
        taxaDeAcerto: resultados.length > 0 ? acertadas.length / resultados.length : 0,
        sequenciaAtual: sequenciaAtual(resultados, hoje),
        melhorSequencia: melhorSequencia(resultados),
        mediaDeLetras: acertadas.length > 0 ? media(acertadas.map((resultado) => resultado.chutes)) : null,
    };
}
