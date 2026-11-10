import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Forca } from "./Forca";

function partesDesenhadas(container: HTMLElement): number {
    return container.querySelectorAll(".forca__parte").length;
}

describe("forca", () => {
    it("começa vazia, só com a estrutura", () => {
        const { container } = render(<Forca erros={0} />);

        expect(screen.getByRole("img", { name: "Forca vazia" })).toBeTruthy();
        expect(partesDesenhadas(container)).toBe(0);
    });

    it("ganha uma parte do boneco a cada erro, na ordem clássica", () => {
        const { container } = render(<Forca erros={3} />);

        expect(screen.getByRole("img", { name: "Forca com cabeça, tronco e braço esquerdo" })).toBeTruthy();
        expect(partesDesenhadas(container)).toBe(3);
    });

    it("no sexto erro o boneco fica completo", () => {
        const { container } = render(<Forca erros={6} />);

        expect(screen.getByRole("img", { name: "Forca com o boneco completo" })).toBeTruthy();
        expect(partesDesenhadas(container)).toBe(6);
        expect(container.querySelector(".forca--completa")).toBeTruthy();
    });

    it("na versão pequena, diz de quem é a forca", () => {
        const { container } = render(<Forca erros={2} pequena de="Bru" />);

        expect(screen.getByRole("img", { name: "Forca de Bru com cabeça e tronco" })).toBeTruthy();
        expect(container.querySelector(".forca--pequena")).toBeTruthy();
    });

    it("não passa de 6 partes", () => {
        const { container } = render(<Forca erros={9} />);

        expect(partesDesenhadas(container)).toBe(6);
    });
});
