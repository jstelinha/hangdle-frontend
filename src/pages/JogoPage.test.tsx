import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { SEM_RESPOSTA } from "../api/erros";
import { CHAVE_CHUTES_DO_DIA } from "../jogo/chutesDoDia";
import { abrir, entrarComo, erroDeRede } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get);

const MACA_DO_DIA = { dia: "2026-11-03", palavra: "MAÇÃ", categoria: "Comida" };

function tecla(letra: string): HTMLElement {
    return screen.getByRole("button", { name: letra });
}

function valorDoResumo(rotulo: string): string {
    return screen.getByText(rotulo, { selector: "dt" }).nextElementSibling?.textContent ?? "";
}

function jaChutou(dia: string, chutes: string[]) {
    localStorage.setItem(CHAVE_CHUTES_DO_DIA, JSON.stringify({ dia, chutes }));
}

async function abrirJogo() {
    entrarComo("Larissa Souza");
    abrir("/jogo");
    await screen.findByText("Comida");
}

describe("palavra do dia", () => {
    beforeEach(() => {
        get.mockReset();
        get.mockResolvedValue({ data: MACA_DO_DIA });
    });

    it("sem sessão volta para o login", () => {
        abrir("/jogo");

        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();
    });

    it("busca a palavra no back e começa com a forca e as casas vazias", async () => {
        await abrirJogo();

        expect(get).toHaveBeenCalledWith("/palavra-do-dia");
        expect(screen.getByRole("img", { name: "Forca vazia" })).toBeTruthy();
        expect(screen.getByRole("img", { name: "Palavra: vazio, vazio, vazio, vazio" })).toBeTruthy();
    });

    it("letra certa revela, errada desenha o boneco e repetida só avisa", async () => {
        const usuario = userEvent.setup();
        await abrirJogo();

        await usuario.click(tecla("M"));
        expect(screen.getByRole("img", { name: "Palavra: M, vazio, vazio, vazio" })).toBeTruthy();

        await usuario.keyboard("z");
        expect(screen.getByRole("img", { name: "Forca com cabeça" })).toBeTruthy();
        expect(screen.getByText("1 de 6")).toBeTruthy();

        await usuario.keyboard("z");
        expect(screen.getByText("Você já tentou a letra Z. Letra repetida não conta como erro.")).toBeTruthy();
        expect(screen.getByRole("img", { name: "Forca com cabeça" })).toBeTruthy();
    });

    it("completar a palavra mostra o acerto e em quantas letras", async () => {
        await abrirJogo();

        for (const letra of "ZMAC") {
            fireEvent.click(tecla(letra));
        }

        expect(screen.getByRole("heading", { name: "Você acertou a palavra do dia!" })).toBeTruthy();
        expect(valorDoResumo("Letras chutadas")).toBe("4");
        expect(valorDoResumo("Erros")).toBe("1");
        expect(screen.queryByRole("group", { name: "Teclado" })).toBeNull();
    });

    it("no sexto erro o boneco fica completo e a palavra aparece", async () => {
        await abrirJogo();

        for (const letra of "ZWYKLB") {
            fireEvent.click(tecla(letra));
        }

        expect(screen.getByRole("heading", { name: "O boneco ficou completo." })).toBeTruthy();
        expect(screen.getByRole("img", { name: "Forca com o boneco completo" })).toBeTruthy();
        expect(screen.getByText("MAÇÃ")).toBeTruthy();
    });

    it("cada chute fica guardado no navegador", async () => {
        await abrirJogo();

        fireEvent.click(tecla("Z"));
        fireEvent.click(tecla("M"));

        expect(JSON.parse(localStorage.getItem(CHAVE_CHUTES_DO_DIA) ?? "null")).toEqual({ dia: "2026-11-03", chutes: ["Z", "M"] });
    });

    it("recarregar no meio da partida continua de onde parou", async () => {
        jaChutou("2026-11-03", ["Z", "M"]);

        await abrirJogo();

        expect(screen.getByRole("img", { name: "Forca com cabeça" })).toBeTruthy();
        expect(screen.getByRole("img", { name: "Palavra: M, vazio, vazio, vazio" })).toBeTruthy();
    });

    it("quem já jogou hoje vê o resultado e quanto falta para a próxima palavra", async () => {
        jaChutou("2026-11-03", ["M", "A", "C"]);

        await abrirJogo();

        expect(screen.getByRole("heading", { name: "Você acertou a palavra do dia!" })).toBeTruthy();
        expect(screen.getByRole("timer").textContent).toMatch(/^Próxima palavra em \d{2}:\d{2}:\d{2}$/);
        expect(screen.queryByRole("group", { name: "Teclado" })).toBeNull();
    });

    it("chutes de outro dia não contam", async () => {
        jaChutou("2026-11-02", ["Z", "M"]);

        await abrirJogo();

        expect(screen.getByRole("img", { name: "Forca vazia" })).toBeTruthy();
    });

    it("servidor fora do ar: avisa e deixa tentar de novo", async () => {
        get.mockRejectedValueOnce(erroDeRede());
        const usuario = userEvent.setup();
        entrarComo("Larissa Souza");
        abrir("/jogo");

        expect((await screen.findByRole("alert")).textContent).toBe(SEM_RESPOSTA);

        await usuario.click(screen.getByRole("button", { name: "Tentar de novo" }));

        expect(await screen.findByText("Comida")).toBeTruthy();
    });
});
