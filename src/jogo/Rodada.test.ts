import { describe, expect, it } from "vitest";
import { Rodada } from "./Rodada";

function relogio(inicio = 0) {
    let agora = inicio;
    return {
        agora: () => agora,
        avancar: (milissegundos: number) => {
            agora += milissegundos;
        },
    };
}

const MACA = { texto: "MAÇÃ", categoria: "Comida", nivel: "facil" } as const;
const ABACAXI = { texto: "ABACAXI", categoria: "Comida", nivel: "medio" } as const;
const PAO_DE_QUEIJO = { texto: "PÃO DE QUEIJO", categoria: "Comida", nivel: "dificil" } as const;

function visivel(rodada: Rodada): string {
    return rodada.casas.map((casa) => (casa.revelada ? casa.caractere : "_")).join("");
}

describe("regra de chute", () => {
    it("A revela A e Ã; C revela Ç", () => {
        const rodada = new Rodada(MACA);

        expect(rodada.chutar("a")).toBe("acerto");
        expect(visivel(rodada)).toBe("_A_Ã");
        expect(rodada.chutar("C")).toBe("acerto");
        expect(visivel(rodada)).toBe("_AÇÃ");
    });

    it("tecla com acento conta como a letra sem acento", () => {
        const rodada = new Rodada(MACA);

        expect(rodada.chutar("ã")).toBe("acerto");
        expect(rodada.letrasCertas).toEqual(["A"]);
    });

    it("espaços já começam revelados", () => {
        const rodada = new Rodada(PAO_DE_QUEIJO);

        expect(visivel(rodada)).toBe("___ __ ______");
    });

    it("completar a palavra encerra a rodada como acerto", () => {
        const rodada = new Rodada(MACA);

        rodada.chutar("M");
        rodada.chutar("A");
        rodada.chutar("C");

        expect(rodada.estado).toBe("acertou");
        expect(rodada.chutar("Z")).toBe("encerrada");
    });

    it("letra repetida só avisa e não custa vida", () => {
        const rodada = new Rodada(ABACAXI);

        rodada.chutar("Z");
        expect(rodada.chutar("Z")).toBe("repetida");
        expect(rodada.chutar("A")).toBe("acerto");
        expect(rodada.chutar("A")).toBe("repetida");

        expect(rodada.erros).toBe(1);
        expect(rodada.vidasRestantes).toBe(5);
    });

    it("tecla que não é letra é ignorada", () => {
        const rodada = new Rodada(ABACAXI);

        expect(rodada.chutar("1")).toBe("invalida");
        expect(rodada.chutar(" ")).toBe("invalida");
        expect(rodada.erros).toBe(0);
    });

    it("no Médio, o sexto erro acaba com as 6 vidas", () => {
        const rodada = new Rodada(ABACAXI);

        for (const letra of "ZWYKL") {
            rodada.chutar(letra);
        }
        expect(rodada.estado).toBe("jogando");
        expect(rodada.vidasRestantes).toBe(1);

        expect(rodada.chutar("M")).toBe("erro");
        expect(rodada.estado).toBe("sem_vidas");
        expect(rodada.letrasErradas).toEqual(["Z", "W", "Y", "K", "L", "M"]);
    });

    it("no Difícil, 4 vidas", () => {
        const rodada = new Rodada(PAO_DE_QUEIJO);

        for (const letra of "ZWYK") {
            rodada.chutar(letra);
        }

        expect(rodada.estado).toBe("sem_vidas");
        expect(rodada.vidasRestantes).toBe(0);
    });
});

describe("tempo da rodada", () => {
    it("conta os segundos restantes arredondando para baixo", () => {
        const tempo = relogio();
        const rodada = new Rodada(MACA, tempo.agora);

        tempo.avancar(30_500);

        expect(rodada.segundosRestantes).toBe(89);
    });

    it("no Médio, o tempo acaba aos 90 segundos", () => {
        const tempo = relogio();
        const rodada = new Rodada(ABACAXI, tempo.agora);

        tempo.avancar(89_999);
        rodada.atualizarTempo();
        expect(rodada.estado).toBe("jogando");

        tempo.avancar(1);
        rodada.atualizarTempo();
        expect(rodada.estado).toBe("tempo_esgotado");
        expect(rodada.segundosRestantes).toBe(0);
        expect(rodada.segundosGastos).toBe(90);
    });

    it("chute depois do tempo não vale", () => {
        const tempo = relogio();
        const rodada = new Rodada(PAO_DE_QUEIJO, tempo.agora);

        tempo.avancar(45_000);

        expect(rodada.chutar("P")).toBe("encerrada");
        expect(rodada.estado).toBe("tempo_esgotado");
    });

    it("os segundos restantes param quando a palavra é completada", () => {
        const tempo = relogio();
        const rodada = new Rodada(MACA, tempo.agora);

        tempo.avancar(20_000);
        rodada.chutar("M");
        rodada.chutar("A");
        rodada.chutar("C");
        tempo.avancar(50_000);

        expect(rodada.segundosRestantes).toBe(100);
        expect(rodada.segundosGastos).toBe(20);
    });
});
