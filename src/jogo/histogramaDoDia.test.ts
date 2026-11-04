import { describe, expect, it } from "vitest";
import { colunasDoDia } from "./histogramaDoDia";

const DIA = {
    dia: "2026-11-03",
    jogadores: 6,
    naoAcertaram: 1,
    distribuicao: [
        { letras: 4, jogadores: 2 },
        { letras: 7, jogadores: 3 },
    ],
};

describe("histograma do dia", () => {
    it("tem uma coluna para cada número de letras, sem pular os que ficaram vazios", () => {
        const colunas = colunasDoDia(DIA, { acertou: true, chutes: 4 }, { somarSeu: false });

        expect(colunas.map((coluna) => [coluna.rotulo, coluna.jogadores])).toEqual([
            ["4 letras", 2],
            ["5 letras", 0],
            ["6 letras", 0],
            ["7 letras", 3],
            ["Não acertou", 1],
        ]);
    });

    it("destaca a sua coluna", () => {
        const colunas = colunasDoDia(DIA, { acertou: true, chutes: 7 }, { somarSeu: false });

        expect(colunas.filter((coluna) => coluna.suaColuna).map((coluna) => coluna.rotulo)).toEqual(["7 letras"]);
    });

    it("quem não acertou fica na última coluna", () => {
        const colunas = colunasDoDia(DIA, { acertou: false, chutes: 6 }, { somarSeu: true });

        expect(colunas.at(-1)).toEqual({ rotulo: "Não acertou", jogadores: 2, suaColuna: true });
    });

    it("soma o seu resultado quando ele ainda não está na conta do servidor", () => {
        const colunas = colunasDoDia(DIA, { acertou: true, chutes: 9 }, { somarSeu: true });

        expect(colunas.find((coluna) => coluna.rotulo === "9 letras")).toEqual({ rotulo: "9 letras", jogadores: 1, suaColuna: true });
    });

    it("dia sem ninguém ainda mostra só a sua coluna", () => {
        const vazio = { dia: "2026-11-03", jogadores: 0, naoAcertaram: 0, distribuicao: [] };

        const colunas = colunasDoDia(vazio, { acertou: true, chutes: 5 }, { somarSeu: true });

        expect(colunas).toEqual([
            { rotulo: "5 letras", jogadores: 1, suaColuna: true },
            { rotulo: "Não acertou", jogadores: 0, suaColuna: false },
        ]);
    });
});
