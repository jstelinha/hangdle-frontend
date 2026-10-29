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

function linhaDe(tabela: HTMLElement, jogador: string): string[] {
    const linha = within(tabela)
        .getAllByRole("row")
        .find((candidata) => within(candidata).queryByText(jogador) !== null);
    return linha ? within(linha).getAllByRole("cell").map((celula) => celula.textContent ?? "") : [];
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

    it("partida completa termina no ranking e nos gráficos com os pontos de cada nível", () => {
        vi.useFakeTimers();
        entrarComo("Larissa Souza");
        abrir("/jogo");

        fireEvent.click(screen.getByRole("button", { name: "Começar a rodada 1" }));
        clicarLetras("MAC");
        fireEvent.click(screen.getByRole("button", { name: "Começar a rodada 2" }));
        clicarLetras("ABCXI");
        fireEvent.click(screen.getByRole("button", { name: "Começar a rodada 3" }));
        clicarLetras("PAODEQUIJ");
        expect(screen.getByText("Acertou primeiro (+30)")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Ver o resultado da partida" }));

        expect(screen.getByRole("heading", { name: "Fim da partida" })).toBeTruthy();
        expect(screen.getByText("Você ficou em 1º lugar entre 6 jogadores.")).toBeTruthy();

        const [ranking, pontosPorRodada] = screen.getAllByRole("table");
        expect(linhaDe(ranking!, "Você")).toEqual(["1º", "Você", "1260"]);

        const pontos = within(pontosPorRodada!).getAllByRole("row").slice(1).map((linha) => within(linha).getAllByRole("cell")[1]?.textContent);
        expect(pontos).toEqual(["370", "450", "440"]);
    });
});
