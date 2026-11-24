import { describe, expect, it } from "vitest";
import { Rodada } from "./Rodada";

function visivel(rodada: Rodada): string {
    return rodada.casas.map((casa) => (casa.revelada ? casa.caractere : "_")).join("");
}

describe("regra de chute", () => {
    it("A revela A e Ã; C revela Ç", () => {
        const rodada = new Rodada("MAÇÃ");

        expect(rodada.chutar("a")).toBe("acerto");
        expect(visivel(rodada)).toBe("_A_Ã");
        expect(rodada.chutar("C")).toBe("acerto");
        expect(visivel(rodada)).toBe("_AÇÃ");
    });

    it("tecla com acento conta como a letra sem acento", () => {
        const rodada = new Rodada("MAÇÃ");

        expect(rodada.chutar("ã")).toBe("acerto");
        expect(rodada.letrasCertas).toEqual(["A"]);
    });

    it("espaços e hífens já começam revelados", () => {
        expect(visivel(new Rodada("PÃO DE QUEIJO"))).toBe("___ __ ______");
        expect(visivel(new Rodada("GUARDA-CHUVA"))).toBe("______-_____");
    });

    it("completar a palavra encerra a rodada como acerto", () => {
        const rodada = new Rodada("MAÇÃ");

        rodada.chutar("M");
        rodada.chutar("A");
        rodada.chutar("C");

        expect(rodada.estado).toBe("acertou");
        expect(rodada.chutar("Z")).toBe("encerrada");
    });

    it("letra repetida só avisa e não conta como erro", () => {
        const rodada = new Rodada("ABACAXI");

        rodada.chutar("Z");
        expect(rodada.chutar("Z")).toBe("repetida");
        expect(rodada.chutar("A")).toBe("acerto");
        expect(rodada.chutar("A")).toBe("repetida");

        expect(rodada.erros).toBe(1);
        expect(rodada.chutes).toEqual(["Z", "A"]);
    });

    it("tecla que não é letra é ignorada", () => {
        const rodada = new Rodada("ABACAXI");

        expect(rodada.chutar("1")).toBe("invalida");
        expect(rodada.chutar(" ")).toBe("invalida");
        expect(rodada.erros).toBe(0);
        expect(rodada.chutes).toEqual([]);
    });

    it("o sexto erro completa o boneco e encerra a rodada", () => {
        const rodada = new Rodada("ABACAXI");

        for (const letra of "ZWYKL") {
            rodada.chutar(letra);
        }
        expect(rodada.estado).toBe("jogando");

        expect(rodada.chutar("M")).toBe("erro");
        expect(rodada.estado).toBe("perdeu");
        expect(rodada.letrasErradas).toEqual(["Z", "W", "Y", "K", "L", "M"]);
    });

    it("guarda os chutes na ordem em que foram feitos", () => {
        const rodada = new Rodada("ABACAXI");

        for (const letra of "XZAB") {
            rodada.chutar(letra);
        }

        expect(rodada.chutes).toEqual(["X", "Z", "A", "B"]);
    });
});

describe("rodada refeita a partir dos chutes", () => {
    it("chega no mesmo estado da rodada jogada", () => {
        const rodada = Rodada.aPartirDosChutes("MAÇÃ", ["Z", "M", "A", "C"]);

        expect(rodada.estado).toBe("acertou");
        expect(rodada.erros).toBe(1);
        expect(visivel(rodada)).toBe("MAÇÃ");
    });
});
