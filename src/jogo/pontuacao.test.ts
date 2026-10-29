import { describe, expect, it } from "vitest";
import { pontosDaRodada } from "./pontuacao";

describe("pontos da rodada", () => {
    it.each([
        ["Fácil, 8 vidas, 100 s, primeiro", { vidasRestantes: 8, segundosRestantes: 100, multiplicador: 1, primeiroAAcertar: true }, 350],
        ["Médio, 4 vidas, 30 s", { vidasRestantes: 4, segundosRestantes: 30, multiplicador: 1.5, primeiroAAcertar: false }, 285],
        ["Médio com meio ponto, 5 vidas, 40 s", { vidasRestantes: 5, segundosRestantes: 40, multiplicador: 1.5, primeiroAAcertar: false }, 323],
        ["Difícil, 1 vida, 10 s, primeiro", { vidasRestantes: 1, segundosRestantes: 10, multiplicador: 2, primeiroAAcertar: true }, 280],
    ])("%s", (_caso, desempenho, esperado) => {
        expect(pontosDaRodada({ acertou: true, ...desempenho })).toBe(esperado);
    });

    it("quem não acerta faz 0, mesmo marcado como primeiro", () => {
        expect(
            pontosDaRodada({ acertou: false, vidasRestantes: 3, segundosRestantes: 50, multiplicador: 2, primeiroAAcertar: true }),
        ).toBe(0);
    });
});
