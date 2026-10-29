import { describe, expect, it } from "vitest";
import { pontosPorRodada, errosPorTempo } from "./analise";
import { fecharRodada, rankingAcumulado } from "./partida";

const ABACAXI = { texto: "ABACAXI", categoria: "Comida", nivel: "medio" } as const;
const MACA = { texto: "MAÇÃ", categoria: "Comida", nivel: "facil" } as const;
const PAO_DE_QUEIJO = { texto: "PÃO DE QUEIJO", categoria: "Comida", nivel: "dificil" } as const;

describe("fechar a rodada", () => {
    it("jogando sozinho, acertar não dá o bônus de primeiro", () => {
        const rodada = fecharRodada(2, ABACAXI, [{ nome: "Você", acertou: true, erros: 2, segundosGastos: 30 }]);

        expect(rodada.participantes[0]?.pontos).toBe(330);
        expect(rodada.participantes[0]?.primeiroAAcertar).toBe(false);
    });

    it("com adversários, dá os 30 pontos de bônus só a quem acertou mais rápido", () => {
        const rodada = fecharRodada(2, ABACAXI, [
            { nome: "Você", acertou: true, erros: 2, segundosGastos: 30 },
            { nome: "Bia", acertou: true, erros: 0, segundosGastos: 20 },
            { nome: "Caio", acertou: false, erros: 6, segundosGastos: 41 },
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
            { nome: "Você", acertou: true, erros: 0, segundosGastos: 20 },
            { nome: "Bia", acertou: false, erros: 8, segundosGastos: 60 },
        ]);
        const segunda = fecharRodada(2, ABACAXI, [
            { nome: "Você", acertou: false, erros: 6, segundosGastos: 50 },
            { nome: "Bia", acertou: true, erros: 0, segundosGastos: 20 },
        ]);

        expect(rankingAcumulado([primeira, segunda])).toEqual([
            { nome: "Bia", pontos: 420 },
            { nome: "Você", pontos: 350 },
        ]);
    });
});

describe("dados dos gráficos, só com as rodadas do jogador", () => {
    const rodadas = [
        fecharRodada(1, MACA, [{ nome: "Você", acertou: true, erros: 1, segundosGastos: 10 }]),
        fecharRodada(2, ABACAXI, [{ nome: "Você", acertou: true, erros: 2, segundosGastos: 30 }]),
        fecharRodada(3, PAO_DE_QUEIJO, [{ nome: "Você", acertou: true, erros: 3, segundosGastos: 40 }]),
    ];

    it("colunas: os pontos de cada rodada", () => {
        expect(pontosPorRodada(rodadas, "Você")).toEqual([
            { rodada: "1 · Fácil", pontos: 315 },
            { rodada: "2 · Médio", pontos: 330 },
            { rodada: "3 · Difícil", pontos: 240 },
        ]);
    });

    it("dispersão: erros no X, segundos no Y e a reta de regressão nas pontas", () => {
        const dados = errosPorTempo(rodadas, "Você");

        expect(dados.pontos).toEqual([
            { x: 1, y: 10, rodada: "1 · Fácil", nivel: "Fácil" },
            { x: 2, y: 30, rodada: "2 · Médio", nivel: "Médio" },
            { x: 3, y: 40, rodada: "3 · Difícil", nivel: "Difícil" },
        ]);
        expect(dados.regressao?.inclinacao).toBeCloseTo(15, 10);
        expect(dados.regressao?.intercepto).toBeCloseTo(-10 / 3, 10);
        expect(dados.regressao?.r2).toBeCloseTo(27 / 28, 10);
        expect(dados.reta).toEqual([
            { x: 1, y: 11.7 },
            { x: 3, y: 41.7 },
        ]);
    });

    it("mesma quantidade de erros em todas as rodadas: sem reta", () => {
        const iguais = [
            fecharRodada(1, MACA, [{ nome: "Você", acertou: true, erros: 2, segundosGastos: 10 }]),
            fecharRodada(2, ABACAXI, [{ nome: "Você", acertou: true, erros: 2, segundosGastos: 30 }]),
        ];

        expect(errosPorTempo(iguais, "Você").regressao).toBeNull();
        expect(errosPorTempo(iguais, "Você").reta).toEqual([]);
    });
});
