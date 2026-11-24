import { describe, expect, it } from "vitest";
import { casasDaForca, casasDaPalavra, separarLetras, totalDeLetras } from "./forcaDaSala";

describe("forca da sala", () => {
    it("transforma as casas do back nas casas da palavra", () => {
        expect(casasDaForca(["Ã", null, " ", "-"])).toEqual([
            { caractere: "Ã", tipo: "letra", revelada: true },
            { caractere: "", tipo: "letra", revelada: false },
            { caractere: " ", tipo: "separador", revelada: true },
            { caractere: "-", tipo: "separador", revelada: true },
        ]);
    });

    it("abre todas as casas para quem já sabe a palavra", () => {
        expect(casasDaPalavra("PÉ").every((casa) => casa.revelada)).toBe(true);
    });

    it("conta só as letras, sem o espaço e o hífen", () => {
        expect(totalDeLetras([null, "A", " ", null, "-", null])).toBe(4);
    });

    it("separa as letras certas das erradas pelas casas abertas, sem contar acento", () => {
        expect(separarLetras(["M", "A", "Ç", "Ã"], ["Z", "C", "A", "M"])).toEqual({ certas: ["C", "A", "M"], erradas: ["Z"] });
    });
});
