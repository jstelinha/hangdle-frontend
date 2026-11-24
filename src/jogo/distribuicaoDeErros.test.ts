import { describe, expect, it } from "vitest";
import { BONECO_COMPLETO, distribuicaoDeErros } from "./distribuicaoDeErros";

const quantidades = (linhas: ReturnType<typeof distribuicaoDeErros>) => linhas.map((linha) => linha.quantidade);

describe("distribuição de erros", () => {
    it("tem sempre de 0 a 5 erros e o boneco completo, mesmo sem partidas", () => {
        const linhas = distribuicaoDeErros([]);

        expect(linhas.map((linha) => linha.rotulo)).toEqual(["0", "1", "2", "3", "4", "5", "☠"]);
        expect(linhas.map((linha) => linha.nome)).toEqual(["0 erros", "1 erro", "2 erros", "3 erros", "4 erros", "5 erros", BONECO_COMPLETO]);
        expect(quantidades(linhas)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it("conta os acertos pelos erros e as derrotas no boneco completo", () => {
        const partidas = [
            { acertou: true, erros: 0 },
            { acertou: true, erros: 2 },
            { acertou: true, erros: 2 },
            { acertou: false, erros: 6 },
        ];

        expect(quantidades(distribuicaoDeErros(partidas))).toEqual([1, 0, 2, 0, 0, 0, 1]);
    });

    it("destaca só a linha da partida de hoje", () => {
        const destacadas = (hoje: { acertou: boolean; erros: number }) =>
            distribuicaoDeErros([hoje], hoje)
                .filter((linha) => linha.destaque)
                .map((linha) => linha.nome);

        expect(destacadas({ acertou: true, erros: 3 })).toEqual(["3 erros"]);
        expect(destacadas({ acertou: false, erros: 6 })).toEqual([BONECO_COMPLETO]);
        expect(distribuicaoDeErros([]).some((linha) => linha.destaque)).toBe(false);
    });
});
