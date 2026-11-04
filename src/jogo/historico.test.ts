import { describe, expect, it } from "vitest";
import type { ResultadoDiario } from "../types/jogo";
import { melhorSequencia, resumirHistorico, sequenciaAtual } from "./historico";

function partida(dia: string, acertou: boolean, chutes = 6): ResultadoDiario {
    return { dia, palavra: "MAÇÃ", categoria: "Comida", letras: [], chutes, erros: acertou ? 1 : 6, acertou };
}

describe("histórico", () => {
    it("a sequência atual conta os dias seguidos acertando até hoje", () => {
        const resultados = [partida("2026-11-03", true), partida("2026-11-02", true), partida("2026-10-31", true)];

        expect(sequenciaAtual(resultados, "2026-11-03")).toBe(2);
    });

    it("a sequência continua valendo se a pessoa ainda não jogou hoje", () => {
        const resultados = [partida("2026-11-02", true), partida("2026-11-01", true)];

        expect(sequenciaAtual(resultados, "2026-11-03")).toBe(2);
    });

    it("perder hoje zera a sequência atual", () => {
        const resultados = [partida("2026-11-03", false), partida("2026-11-02", true)];

        expect(sequenciaAtual(resultados, "2026-11-03")).toBe(0);
    });

    it("a melhor sequência atravessa a virada do mês", () => {
        const resultados = [
            partida("2026-10-30", true),
            partida("2026-10-31", true),
            partida("2026-11-01", true),
            partida("2026-11-02", false),
            partida("2026-11-03", true),
        ];

        expect(melhorSequencia(resultados)).toBe(3);
    });

    it("resume partidas, acertos e a média de letras das que acertou", () => {
        const resumo = resumirHistorico([partida("2026-11-03", true, 5), partida("2026-11-02", false), partida("2026-11-01", true, 7)], "2026-11-03");

        expect(resumo).toEqual({
            partidas: 3,
            acertos: 2,
            taxaDeAcerto: 2 / 3,
            sequenciaAtual: 1,
            melhorSequencia: 1,
            mediaDeLetras: 6,
        });
    });

    it("sem acertos não tem média de letras", () => {
        expect(resumirHistorico([partida("2026-11-03", false)], "2026-11-03").mediaDeLetras).toBeNull();
    });
});
