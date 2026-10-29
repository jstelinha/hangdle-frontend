import { describe, expect, it } from "vitest";
import { pontosPorRodada, errosPorTempo } from "./analise";
import { fecharRodada, rankingAcumulado } from "./partida";

const ABACAXI = { texto: "ABACAXI", categoria: "Comida", nivel: "medio" } as const;
const MACA = { texto: "MAÇÃ", categoria: "Comida", nivel: "facil" } as const;

describe("fechar a rodada", () => {
    it("dá os 30 pontos de bônus só a quem acertou mais rápido", () => {
        const rodada = fecharRodada(2, ABACAXI, [
            { nome: "Você", simulado: false, acertou: true, erros: 2, segundosGastos: 30 },
            { nome: "Bia", simulado: true, acertou: true, erros: 0, segundosGastos: 20 },
            { nome: "Caio", simulado: true, acertou: false, erros: 6, segundosGastos: 41 },
        ]);

        expect(rodada.participantes.map((participante) => [participante.nome, participante.pontos])).toEqual([
            ["Você", 330],
            ["Bia", 420],
            ["Caio", 0],
        ]);
        expect(rodada.participantes[1]?.primeiroAAcertar).toBe(true);
    });

    it("soma o ranking de todas as rodadas, do maior para o menor", () => {
        const primeira = fecharRodada(1, MACA, [
            { nome: "Você", simulado: false, acertou: true, erros: 0, segundosGastos: 20 },
            { nome: "Bia", simulado: true, acertou: false, erros: 8, segundosGastos: 60 },
        ]);
        const segunda = fecharRodada(2, ABACAXI, [
            { nome: "Você", simulado: false, acertou: false, erros: 6, segundosGastos: 50 },
            { nome: "Bia", simulado: true, acertou: true, erros: 0, segundosGastos: 20 },
        ]);

        expect(rankingAcumulado([primeira, segunda])).toEqual([
            { nome: "Bia", simulado: true, pontos: 420 },
            { nome: "Você", simulado: false, pontos: 350 },
        ]);
    });
});

describe("dados dos gráficos", () => {
    const rodada = fecharRodada(2, ABACAXI, [
        { nome: "Você", simulado: false, acertou: true, erros: 2, segundosGastos: 30 },
        { nome: "Bia", simulado: true, acertou: true, erros: 0, segundosGastos: 20 },
        { nome: "Caio", simulado: true, acertou: false, erros: 6, segundosGastos: 41 },
    ]);

    it("colunas: os seus pontos ao lado da média dos rivais", () => {
        expect(pontosPorRodada([rodada])).toEqual([{ rodada: "2 · Médio", voce: 330, mediaRivais: 210 }]);
    });

    it("dispersão: erros no X, segundos no Y e a reta de regressão nas pontas", () => {
        const dados = errosPorTempo([rodada]);

        expect(dados.voce).toEqual([{ x: 2, y: 30 }]);
        expect(dados.rivais).toEqual([
            { x: 0, y: 20 },
            { x: 6, y: 41 },
        ]);
        expect(dados.regressao?.inclinacao).toBeCloseTo(95 / 28, 10);
        expect(dados.regressao?.intercepto).toBeCloseTo(447 / 21, 10);
        expect(dados.reta).toEqual([
            { x: 0, y: 21.3 },
            { x: 6, y: 41.6 },
        ]);
    });
});
