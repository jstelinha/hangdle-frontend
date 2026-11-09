import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { SEM_RESPOSTA } from "../api/erros";
import { abrir, entrarComo, erroDaApi, erroDeRede } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const apagar = vi.mocked(api.delete);

const ANIMAIS = { id: 3, nome: "Animais", totalDePalavras: 12 };
const FRUTAS = { id: 4, nome: "Frutas", totalDePalavras: 0 };

function pagina<T>(itens: T[], numero = 1, totalDePaginas = 1) {
    return { data: { itens, pagina: numero, porPagina: 10, total: itens.length + (totalDePaginas - 1) * 10, totalDePaginas } };
}

async function abrirListas(endereco = "/listas") {
    entrarComo("Larissa Souza");
    abrir(endereco);
    return screen.findByRole("table");
}

describe("listagem das listas", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        get.mockResolvedValue(pagina([ANIMAIS, FRUTAS]));
    });

    it("é só para quem entrou", () => {
        abrir("/listas");

        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();
    });

    it("mostra as listas com quantas palavras cada uma tem", async () => {
        const tabela = await abrirListas();

        expect(get).toHaveBeenCalledWith("/listas", { params: { pagina: 1 } });
        expect(within(tabela).getByText("2 listas")).toBeTruthy();
        expect(within(tabela).getByRole("link", { name: "Animais" }).getAttribute("href")).toBe("/listas/3/palavras");
        expect(within(tabela).getByText("12")).toBeTruthy();
        expect(within(tabela).getByRole("link", { name: "Editar Frutas" }).getAttribute("href")).toBe("/listas/4/editar");
        expect(screen.getByRole("link", { name: "Nova lista" }).getAttribute("href")).toBe("/listas/nova");
    });

    it("fica no menu do cabeçalho, marcada como a página atual", async () => {
        await abrirListas();

        const menu = screen.getByRole("navigation", { name: "Principal" });
        expect(within(menu).getByRole("link", { name: "Listas" }).getAttribute("aria-current")).toBe("page");
        expect(within(menu).getByRole("link", { name: "Jogar" }).getAttribute("aria-current")).toBeNull();
    });

    it("anda pelas páginas", async () => {
        get.mockResolvedValueOnce(pagina([ANIMAIS], 2, 2)).mockResolvedValueOnce(pagina([FRUTAS], 1, 2));
        const usuario = userEvent.setup();
        await abrirListas("/listas?pagina=2");

        expect(get).toHaveBeenCalledWith("/listas", { params: { pagina: 2 } });
        expect(screen.getByText("Página 2 de 2")).toBeTruthy();
        await usuario.click(screen.getByRole("link", { name: "Anterior" }));

        expect(await screen.findByText("Página 1 de 2")).toBeTruthy();
        expect(get).toHaveBeenLastCalledWith("/listas", { params: { pagina: 1 } });
        expect(screen.getByRole("link", { name: "Frutas" })).toBeTruthy();
    });

    it("convida a criar a primeira lista", async () => {
        get.mockResolvedValueOnce(pagina([]));
        entrarComo("Larissa Souza");
        abrir("/listas");

        expect(await screen.findByText(/Você ainda não tem listas/)).toBeTruthy();
        expect(screen.getByRole("link", { name: "Criar a primeira" }).getAttribute("href")).toBe("/listas/nova");
    });

    it("apaga depois de confirmar e busca a página de novo", async () => {
        apagar.mockResolvedValueOnce({ data: "" });
        const usuario = userEvent.setup();
        await abrirListas();
        get.mockResolvedValueOnce(pagina([FRUTAS]));

        await usuario.click(screen.getByRole("button", { name: "Apagar Animais" }));
        expect(apagar).not.toHaveBeenCalled();
        await usuario.click(screen.getByRole("button", { name: "Sim, apagar" }));

        expect(apagar).toHaveBeenCalledWith("/listas/3");
        expect((await screen.findByRole("status")).textContent).toBe("A lista Animais foi apagada, com as palavras dela.");
        expect(await screen.findByText("1 lista")).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Animais" })).toBeNull();
    });

    it("avisa quando não deu para apagar", async () => {
        apagar.mockRejectedValueOnce(erroDaApi(404, { mensagem: "Lista não encontrada." }));
        const usuario = userEvent.setup();
        await abrirListas();

        await usuario.click(screen.getByRole("button", { name: "Apagar Animais" }));
        await usuario.click(screen.getByRole("button", { name: "Sim, apagar" }));

        expect((await screen.findByRole("alert")).textContent).toBe("Lista não encontrada.");
        expect(screen.getByRole("link", { name: "Animais" })).toBeTruthy();
    });

    it("avisa quando não conseguiu buscar as listas", async () => {
        get.mockRejectedValueOnce(erroDeRede());
        entrarComo("Larissa Souza");
        abrir("/listas");

        expect((await screen.findByRole("alert")).textContent).toBe(SEM_RESPOSTA);
    });
});
