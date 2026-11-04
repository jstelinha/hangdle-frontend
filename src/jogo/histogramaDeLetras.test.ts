import { describe, expect, it } from "vitest";
import type { ResultadoDiario } from "../types/jogo";
import { colunasPorLetras, contagemDoHistorico, somarResultado } from "./histogramaDeLetras";

const DIA = {
    naoAcertaram: 1,
    distribuicao: [
        { letras: 4, jogadores: 2 },
        { letras: 7, jogadores: 3 },
    ],
};

function linhas(colunas: ReturnType<typeof colunasPorLetras>) {
    return colunas.map((coluna) => [coluna.rotulo, coluna.quantidade, coluna.destaque]);
}

describe("histograma de letras", () => {
    it("tem uma coluna para cada número de letras, sem pular os que ficaram vazios", () => {
        expect(linhas(colunasPorLetras(DIA))).toEqual([
            ["4 letras", 2, false],
            ["5 letras", 0, false],
            ["6 letras", 0, false],
            ["7 letras", 3, false],
            ["Não acertou", 1, false],
        ]);
    });

    it("destaca a coluna de quem jogou", () => {
        const destacadas = colunasPorLetras(DIA, { acertou: true, chutes: 7 }).filter((coluna) => coluna.destaque);

        expect(destacadas.map((coluna) => coluna.rotulo)).toEqual(["7 letras"]);
    });

    it("quem não acertou fica na última coluna", () => {
        expect(colunasPorLetras(DIA, { acertou: false, chutes: 6 }).at(-1)).toEqual({ rotulo: "Não acertou", quantidade: 1, destaque: true });
    });

    it("soma um resultado que ainda não está na conta", () => {
        const comOSeu = somarResultado(DIA, { acertou: true, chutes: 9 });

        expect(colunasPorLetras(comOSeu, { acertou: true, chutes: 9 }).find((coluna) => coluna.rotulo === "9 letras")).toEqual({
            rotulo: "9 letras",
            quantidade: 1,
            destaque: true,
        });
        expect(somarResultado(DIA, { acertou: false, chutes: 6 }).naoAcertaram).toBe(2);
    });

    it("dia sem ninguém ainda mostra só a coluna de quem jogou", () => {
        const vazio = { distribuicao: [], naoAcertaram: 0 };

        expect(linhas(colunasPorLetras(somarResultado(vazio, { acertou: true, chutes: 5 }), { acertou: true, chutes: 5 }))).toEqual([
            ["5 letras", 1, true],
            ["Não acertou", 0, false],
        ]);
    });

    it("conta as partidas do histórico", () => {
        const partida = (acertou: boolean, chutes: number): ResultadoDiario => ({
            dia: "2026-11-03",
            palavra: "MAÇÃ",
            categoria: "Comida",
            letras: [],
            chutes,
            erros: 0,
            acertou,
        });

        expect(contagemDoHistorico([partida(true, 5), partida(true, 5), partida(false, 6), partida(true, 7)])).toEqual({
            distribuicao: [
                { letras: 5, jogadores: 2 },
                { letras: 7, jogadores: 1 },
            ],
            naoAcertaram: 1,
        });
    });
});
