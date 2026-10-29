import { regressaoLinear, type Ponto, type Regressao } from "./estatistica";
import type { ResultadoRodada } from "./partida";

export type PontosDaRodada = {
    rodada: string;
    pontos: number;
};

export type PontoDaRodada = Ponto & {
    rodada: string;
    nivel: string;
};

export type ErrosPorTempo = {
    pontos: PontoDaRodada[];
    regressao: Regressao | null;
    reta: Ponto[];
};

function rotulo(rodada: ResultadoRodada): string {
    return `${rodada.numero} · ${rodada.nivel.nome}`;
}

export function pontosPorRodada(rodadas: ResultadoRodada[], jogador: string): PontosDaRodada[] {
    return rodadas.map((rodada) => ({
        rodada: rotulo(rodada),
        pontos: rodada.participantes.find((participante) => participante.nome === jogador)?.pontos ?? 0,
    }));
}

export function errosPorTempo(rodadas: ResultadoRodada[], jogador: string): ErrosPorTempo {
    const pontos = rodadas.flatMap((rodada) =>
        rodada.participantes
            .filter((participante) => participante.nome === jogador)
            .map((participante) => ({ x: participante.erros, y: participante.segundosGastos, rodada: rotulo(rodada), nivel: rodada.nivel.nome })),
    );
    const regressao = regressaoLinear(pontos);

    const xs = pontos.map((ponto) => ponto.x);
    const reta =
        regressao === null
            ? []
            : [Math.min(...xs), Math.max(...xs)].map((x) => ({ x, y: Math.round((regressao.intercepto + regressao.inclinacao * x) * 10) / 10 }));

    return { pontos, regressao, reta };
}
