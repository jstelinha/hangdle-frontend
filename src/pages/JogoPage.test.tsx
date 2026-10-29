import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { abrir, entrarComo } from "../testes/ferramentas";

function tecla(letra: string): HTMLElement {
    return screen.getByRole("button", { name: letra });
}

function clicarLetras(letras: string) {
    for (const letra of letras) {
        fireEvent.click(tecla(letra));
    }
}

function ultimaColuna(tabela: HTMLElement): string[] {
    return within(tabela)
        .getAllByRole("row")
        .slice(1)
        .map((linha) => within(linha).getAllByRole("cell").at(-1)?.textContent ?? "");
}

function valorDoResumo(rotulo: string): string {
    return screen.getByText(rotulo, { selector: "dt" }).nextElementSibling?.textContent ?? "";
}

describe("tela do jogo", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("sem sessão volta para o login", () => {
        abrir("/jogo");

        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();
    });

    it("letra certa revela, errada custa vida e repetida só avisa", async () => {
        entrarComo("Larissa Souza");
        const usuario = userEvent.setup();
        abrir("/jogo");

        await usuario.click(screen.getByRole("button", { name: "Começar a rodada 1" }));
        expect(screen.getByText("Rodada 1 de 3 · Fácil · Comida")).toBeTruthy();

        await usuario.click(tecla("M"));
        expect(screen.getByRole("img", { name: "Palavra: M, vazio, vazio, vazio" })).toBeTruthy();

        await usuario.keyboard("z");
        expect(screen.getByRole("img", { name: "7 de 8 vidas" })).toBeTruthy();

        await usuario.keyboard("z");
        expect(screen.getByText("Você já tentou a letra Z. Letra repetida não conta como erro.")).toBeTruthy();
        expect(screen.getByRole("img", { name: "7 de 8 vidas" })).toBeTruthy();

        await usuario.click(tecla("A"));
        expect(screen.getByRole("img", { name: "Palavra: M, A, vazio, Ã" })).toBeTruthy();

        await usuario.click(tecla("C"));
        expect(screen.getByRole("heading", { name: "Você acertou a palavra!" })).toBeTruthy();
        expect(screen.queryByRole("group", { name: "Teclado" })).toBeNull();
    });

    it("o relógio encerra a rodada quando o tempo acaba", () => {
        vi.useFakeTimers();
        entrarComo("Larissa Souza");
        abrir("/jogo");

        fireEvent.click(screen.getByRole("button", { name: "Começar a rodada 1" }));
        act(() => {
            vi.advanceTimersByTime(120_000);
        });

        expect(screen.getByRole("heading", { name: "O tempo acabou." })).toBeTruthy();
        expect(screen.getByText("MAÇÃ")).toBeTruthy();
    });

    it("partida completa: só as suas rodadas, sem bônus de primeiro e sem nada simulado", () => {
        vi.useFakeTimers();
        entrarComo("Larissa Souza");
        abrir("/jogo");

        fireEvent.click(screen.getByRole("button", { name: "Começar a rodada 1" }));
        clicarLetras("MAC");
        expect(valorDoResumo("Pontos")).toBe("340");
        fireEvent.click(screen.getByRole("button", { name: "Começar a rodada 2" }));
        clicarLetras("ABCXI");
        expect(valorDoResumo("Pontos")).toBe("420");
        fireEvent.click(screen.getByRole("button", { name: "Começar a rodada 3" }));
        clicarLetras("PAODEQUIJ");
        expect(valorDoResumo("Pontos")).toBe("410");
        fireEvent.click(screen.getByRole("button", { name: "Ver o resultado da partida" }));

        expect(screen.getByRole("heading", { name: "Fim da partida" })).toBeTruthy();
        expect(screen.getByText("Você acertou 3 de 3 palavras e fez 1170 pontos.")).toBeTruthy();

        const suasRodadas = screen.getByRole("table", { name: "Suas rodadas" });
        expect(ultimaColuna(suasRodadas)).toEqual(["340", "420", "410", "1170"]);

        const grafico = screen.getByRole("table", { name: "Seus pontos por rodada" });
        expect(ultimaColuna(grafico)).toEqual(["340", "420", "410"]);

        expect(screen.queryByText(/simulad|rivais/i)).toBeNull();
    });
});
