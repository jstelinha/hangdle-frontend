import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { SEM_RESPOSTA } from "../api/erros";
import { CHAVE_CHUTES_DO_DIA } from "../jogo/chutesDoDia";
import { abrir, entrarComo, erroDeRede } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get);

const MACA_DO_DIA = { dia: "2026-11-03", palavra: "MAÇÃ", categoria: "Comida" };
const HOJE_NO_SERVIDOR = { dia: "2026-11-03", jogadores: 3, naoAcertaram: 1, distribuicao: [{ letras: 4, jogadores: 2 }] };

function responderComo(servidor: Record<string, unknown>) {
    get.mockImplementation(async (url: string) => ({ data: servidor[url] }));
}

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
    abrir("/jogo");
    await screen.findByText("Comida");
}

describe("palavra do dia", () => {
    beforeEach(() => {
        get.mockReset();
        responderComo({ "/palavra-do-dia": MACA_DO_DIA, "/palavra-do-dia/estatisticas": HOJE_NO_SERVIDOR });
    });

    it("visitante joga sem conta e vê no cabeçalho onde entrar", async () => {
        await abrirJogo();

        expect(screen.getByRole("heading", { name: "Palavra do dia" })).toBeTruthy();
        expect(within(screen.getByRole("navigation", { name: "Conta" })).getByRole("link", { name: "Entrar" })).toBeTruthy();
    });

    it("quem entrou vê o próprio nome no cabeçalho", async () => {
        entrarComo("Larissa Souza");

        await abrirJogo();

        expect(screen.getByText("Larissa Souza")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Sair" })).toBeTruthy();
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

    it("no fim, mostra como todo mundo foi hoje com a sua coluna destacada", async () => {
        await abrirJogo();

        for (const letra of "ZMAC") {
            fireEvent.click(tecla(letra));
        }

        const tabela = await screen.findByRole("table", { name: "Como todo mundo foi hoje" });
        const linhas = within(tabela)
            .getAllByRole("row")
            .slice(1)
            .map((linha) => within(linha).getAllByRole("cell").map((celula) => celula.textContent));
        expect(linhas).toEqual([
            ["4 letras (você)", "3"],
            ["Não acertou", "1"],
        ]);
        expect(get).toHaveBeenCalledWith("/palavra-do-dia/estatisticas", { params: { dia: "2026-11-03" } });
    });

    it("no fim, convida o visitante a criar conta", async () => {
        jaChutou("2026-11-03", ["M", "A", "C"]);

        await abrirJogo();

        const convite = within(screen.getByRole("complementary", { name: "Guarde seus resultados" }));
        expect(convite.getByRole("link", { name: "Criar conta" }).getAttribute("href")).toBe("/cadastro");
        expect(convite.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
    });

    it("quem já tem conta não vê o convite", async () => {
        entrarComo("Larissa Souza");
        jaChutou("2026-11-03", ["M", "A", "C"]);

        await abrirJogo();

        expect(screen.queryByRole("complementary", { name: "Guarde seus resultados" })).toBeNull();
    });

    it("se as estatísticas falharem, o resultado continua na tela", async () => {
        get.mockImplementation(async (url: string) => {
            if (url === "/palavra-do-dia") {
                return { data: MACA_DO_DIA };
            }
            throw erroDeRede();
        });
        jaChutou("2026-11-03", ["M", "A", "C"]);

        await abrirJogo();

        expect(await screen.findByText("Não deu para carregar como todo mundo foi hoje.")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Você acertou a palavra do dia!" })).toBeTruthy();
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
