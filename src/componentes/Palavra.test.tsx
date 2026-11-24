import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { casasDaPalavra } from "../jogo/forcaDaSala";
import { Palavra } from "./Palavra";

function letrasNaVariavel(palavra: string): string {
    render(<Palavra casas={casasDaPalavra(palavra)} mostrarResposta />);
    return screen.getByRole("img").style.getPropertyValue("--letras");
}

describe("palavra", () => {
    it("o tamanho das casas sai do grupo mais comprido", () => {
        expect(letrasNaVariavel("LOBO GUARA")).toBe("5");
    });

    it("o hífen conta como casa do grupo", () => {
        expect(letrasNaVariavel("GUARDA-CHUVA DE PRAIA")).toBe("12");
    });

    it("aguenta as palavras mais compridas das listas, de 30 letras", () => {
        expect(letrasNaVariavel("A".repeat(30))).toBe("30");
    });
});
