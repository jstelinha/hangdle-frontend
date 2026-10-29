import { media, regressaoLinear, type Ponto, type Regressao } from "./estatistica";
import type { ResultadoRodada } from "./partida";

export type PontosDaRodada = {
    rodada: string;
    voce: number;
    mediaRivais: number;
};

export type ErrosPorTempo = {
    voce: Ponto[];
    rivais: Ponto[];
    regressao: Regressao | null;
    reta: Ponto[];
};

export function pontosPorRodada(rodadas: ResultadoRodada[]): PontosDaRodada[] {
    return rodadas.map((rodada) => {
        const voce = rodada.participantes.find((participante) => !participante.simulado);
        const rivais = rodada.participantes.filter((participante) => participante.simulado);
        return {
            rodada: `${rodada.numero} · ${rodada.nivel.nome}`,
            voce: voce?.pontos ?? 0,
            mediaRivais: Math.round(media(rivais.map((rival) => rival.pontos))),
        };
    });
}

export function errosPorTempo(rodadas: ResultadoRodada[]): ErrosPorTempo {
    const participantes = rodadas.flatMap((rodada) => rodada.participantes);
    const paraPonto = (participante: (typeof participantes)[number]): Ponto => ({ x: participante.erros, y: participante.segundosGastos });
    const todos = participantes.map(paraPonto);
    const regressao = regressaoLinear(todos);

    const xs = todos.map((ponto) => ponto.x);
    const reta =
        regressao === null
            ? []
            : [Math.min(...xs), Math.max(...xs)].map((x) => ({ x, y: Math.round((regressao.intercepto + regressao.inclinacao * x) * 10) / 10 }));

    return {
        voce: participantes.filter((participante) => !participante.simulado).map(paraPonto),
        rivais: participantes.filter((participante) => participante.simulado).map(paraPonto),
        regressao,
        reta,
    };
}
