import { NIVEIS, type Nivel } from "./niveis";
import type { PalavraDaRodada } from "./palavras";
import { pontosDaRodada } from "./pontuacao";

export type DesempenhoParticipante = {
    nome: string;
    acertou: boolean;
    erros: number;
    segundosGastos: number;
};

export type ResultadoParticipante = DesempenhoParticipante & {
    vidasRestantes: number;
    segundosRestantes: number;
    primeiroAAcertar: boolean;
    pontos: number;
};

export type ResultadoRodada = {
    numero: number;
    palavra: PalavraDaRodada;
    nivel: Nivel;
    participantes: ResultadoParticipante[];
};

export type PosicaoNoRanking = {
    nome: string;
    pontos: number;
};

export function fecharRodada(numero: number, palavra: PalavraDaRodada, desempenhos: DesempenhoParticipante[]): ResultadoRodada {
    const nivel = NIVEIS[palavra.nivel];
    const temAdversarios = desempenhos.length > 1;
    const quemAcertou = desempenhos.filter((desempenho) => desempenho.acertou);
    const primeiro = quemAcertou.reduce<DesempenhoParticipante | null>(
        (melhor, atual) => (melhor === null || atual.segundosGastos < melhor.segundosGastos ? atual : melhor),
        null,
    );

    const participantes = desempenhos.map((desempenho) => {
        const vidasRestantes = nivel.vidas - desempenho.erros;
        const segundosRestantes = nivel.segundos - desempenho.segundosGastos;
        const primeiroAAcertar = temAdversarios && desempenho === primeiro;
        const pontos = pontosDaRodada({
            acertou: desempenho.acertou,
            vidasRestantes,
            segundosRestantes,
            multiplicador: nivel.multiplicador,
            primeiroAAcertar,
        });
        return { ...desempenho, vidasRestantes, segundosRestantes, primeiroAAcertar, pontos };
    });

    return { numero, palavra, nivel, participantes };
}

export function rankingAcumulado(rodadas: ResultadoRodada[]): PosicaoNoRanking[] {
    const totais = new Map<string, PosicaoNoRanking>();
    for (const rodada of rodadas) {
        for (const participante of rodada.participantes) {
            const atual = totais.get(participante.nome) ?? { nome: participante.nome, pontos: 0 };
            totais.set(participante.nome, { ...atual, pontos: atual.pontos + participante.pontos });
        }
    }
    return [...totais.values()].sort((a, b) => b.pontos - a.pontos);
}
