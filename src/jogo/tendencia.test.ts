import { describe, expect, it } from "vitest";
import type { ResultadoDiario } from "../types/jogo";
import { descreverTendencia, serieDeLetras } from "./tendencia";

function partida(dia: string, chutes: number, acertou = true): ResultadoDiario {
    return { dia, palavra: "MAÇÃ", categoria: "Comida", letras: [], chutes, erros: 0, acertou };
}

describe("letras por dia", () => {
    it("usa só as partidas acertadas, em ordem de dia", () => {
        const serie = serieDeLetras([partida("2026-11-03", 6), partida("2026-11-02", 9, false), partida("2026-11-01", 8)]);

        expect(serie.pontos.map((ponto) => [ponto.dia, ponto.letras])).toEqual([
            ["2026-11-01", 8],
            ["2026-11-03", 6],
        ]);
    });

    it("conta os dias corridos, inclusive os que a pessoa não jogou", () => {
        const serie = serieDeLetras([partida("2026-11-01", 8), partida("2026-11-03", 6), partida("2026-11-08", 5)]);

        expect(serie.pontos.map((ponto) => ponto.x)).toEqual([0, 2, 7]);
    });

    it("traça a reta de tendência: menos letras com o passar dos dias", () => {
        const serie = serieDeLetras([partida("2026-11-01", 9), partida("2026-11-02", 8), partida("2026-11-03", 7)]);

        expect(serie.regressao?.inclinacao).toBeCloseTo(-1);
        expect(serie.regressao?.r2).toBeCloseTo(1);
        expect(serie.pontos.map((ponto) => ponto.tendencia)).toEqual([9, 8, 7]);
    });

    it("com um só dia não dá para traçar tendência", () => {
        const serie = serieDeLetras([partida("2026-11-01", 9)]);

        expect(serie.regressao).toBeNull();
        expect(serie.pontos[0]?.tendencia).toBeNull();
    });
});

describe("leitura da tendência", () => {
    it("explica em português para onde a reta vai", () => {
        expect(descreverTendencia({ inclinacao: -0.5, intercepto: 9, r2: 0.81 })).toBe(
            "Você está precisando de menos letras: 0,5 a menos por dia, em média (R² = 0,81).",
        );
        expect(descreverTendencia({ inclinacao: 0.01, intercepto: 7, r2: 0.02 })).toBe(
            "Você está estável: o número de letras quase não muda de um dia para o outro (R² = 0,02).",
        );
        expect(descreverTendencia(null)).toBe("Acerte a palavra em pelo menos dois dias diferentes para ver a sua tendência.");
    });
});
