import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { abrir, entrarComo } from "../testes/ferramentas";

function acoes() {
    return within(screen.getByRole("navigation", { name: "Começar" }));
}

describe("tela de entrada", () => {
    it("visitante pode jogar, entrar ou criar conta", () => {
        abrir("/");

        expect(screen.getByRole("heading", { name: "A forca de todo dia" })).toBeTruthy();
        expect(acoes().getByRole("link", { name: "Jogar" }).getAttribute("href")).toBe("/jogo");
        expect(acoes().getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
        expect(acoes().getByRole("link", { name: "Criar conta" }).getAttribute("href")).toBe("/cadastro");
    });

    it("quem já entrou vê o próprio nome e vai direto para o jogo", () => {
        entrarComo("Larissa Souza");
        abrir("/");

        expect(screen.getByText("Olá, Larissa Souza. Seus resultados ficam guardados na sua conta.")).toBeTruthy();
        expect(acoes().getByRole("link", { name: "Jogar" })).toBeTruthy();
        expect(acoes().queryByRole("link", { name: "Entrar" })).toBeNull();
    });
});
