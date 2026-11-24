import type { ResultadoDiario } from "../types/jogo";
import { regressaoLinear, type Regressao } from "./estatistica";

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const VARIACAO_DESPREZIVEL = 0.05;
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const centesimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export type PontoDaSerie = {
    dia: string;
    x: number;
    letras: number;
    tendencia: number | null;
};

export type SerieDeLetras = {
    pontos: PontoDaSerie[];
    regressao: Regressao | null;
};

function diasDesde(inicio: string, dia: string): number {
    return Math.round((Date.parse(dia) - Date.parse(inicio)) / MILISSEGUNDOS_POR_DIA);
}

export function serieDeLetras(resultados: ResultadoDiario[]): SerieDeLetras {
    const acertadas = resultados.filter((resultado) => resultado.acertou).sort((a, b) => a.dia.localeCompare(b.dia));
    const inicio = acertadas[0]?.dia ?? "";
    const base = acertadas.map((resultado) => ({ dia: resultado.dia, x: diasDesde(inicio, resultado.dia), letras: resultado.chutes }));
    const regressao = regressaoLinear(base.map((ponto) => ({ x: ponto.x, y: ponto.letras })));

    return {
        regressao,
        pontos: base.map((ponto) => ({
            ...ponto,
            tendencia: regressao ? Math.round((regressao.intercepto + regressao.inclinacao * ponto.x) * 10) / 10 : null,
        })),
    };
}

export function descreverTendencia(regressao: Regressao | null): string {
    if (regressao === null) {
        return "Acerte a palavra em pelo menos dois dias diferentes para ver a sua tendência.";
    }
    const r2 = `R² = ${centesimal.format(regressao.r2)}`;
    if (Math.abs(regressao.inclinacao) < VARIACAO_DESPREZIVEL) {
        return `Você está estável: o número de letras quase não muda de um dia para o outro (${r2}).`;
    }
    const direcao = regressao.inclinacao < 0 ? "menos" : "mais";
    return `Você está precisando de ${direcao} letras: ${decimal.format(Math.abs(regressao.inclinacao))} a ${direcao} por dia, em média (${r2}).`;
}
