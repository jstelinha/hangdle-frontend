import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const apagar = vi.mocked(api.delete);

const ANIMAIS = { id: 3, nome: "Animais", totalDePalavras: 2 };
const GATO = { id: 8, listaId: 3, palavra: "GATO", dica: "Mia e gosta de leite" };
const ONCA = { id: 9, listaId: 3, palavra: "ONÇA", dica: null };

function pagina<T>(itens: T[]) {
    return { itens, pagina: 1, porPagina: 10, total: itens.length, totalDePaginas: itens.length > 0 ? 1 : 0 };
}

function responder(palavras: unknown[]) {
    get.mockImplementation((url: string) => Promise.resolve({ data: url === "/listas/3" ? ANIMAIS : pagina(palavras) }));
}

async function abrirPalavras() {
    entrarComo("Larissa Souza");
    abrir("/listas/3/palavras");
    return screen.findByRole("table");
}

describe("palavras de uma lista", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        responder([GATO, ONCA]);
    });

    it("mostra o nome da lista e as palavras, com e sem dica", async () => {
        const tabela = await abrirPalavras();

        expect(get).toHaveBeenCalledWith("/listas/3/palavras", { params: { pagina: 1 } });
        expect(await screen.findByRole("heading", { name: "Animais" })).toBeTruthy();
        expect(within(tabela).getByText("2 palavras")).toBeTruthy();
        expect(within(tabela).getByText("Mia e gosta de leite")).toBeTruthy();
        expect(within(tabela).getByText("Sem dica")).toBeTruthy();
        expect(within(tabela).getByRole("link", { name: "Editar ONÇA" }).getAttribute("href")).toBe("/listas/3/palavras/9/editar");
        expect(screen.getByRole("link", { name: "Nova palavra" }).getAttribute("href")).toBe("/listas/3/palavras/nova");
        expect(screen.getByRole("link", { name: "Suas listas" }).getAttribute("href")).toBe("/listas");
    });

    it("apaga uma palavra depois de confirmar", async () => {
        apagar.mockResolvedValueOnce({ data: "" });
        const usuario = userEvent.setup();
        await abrirPalavras();
        responder([ONCA]);

        await usuario.click(screen.getByRole("button", { name: "Apagar GATO" }));
        await usuario.click(screen.getByRole("button", { name: "Sim, apagar" }));

        expect(apagar).toHaveBeenCalledWith("/listas/3/palavras/8");
        expect(await screen.findByText("A palavra GATO foi apagada.")).toBeTruthy();
        expect(await screen.findByText("1 palavra")).toBeTruthy();
    });

    it("convida a acrescentar a primeira palavra", async () => {
        responder([]);
        entrarComo("Larissa Souza");
        abrir("/listas/3/palavras");

        expect(await screen.findByText(/Esta lista ainda não tem palavras/)).toBeTruthy();
        expect(screen.getByRole("link", { name: "Acrescentar a primeira" }).getAttribute("href")).toBe("/listas/3/palavras/nova");
    });

    it("não mostra as palavras da lista de outra pessoa", async () => {
        get.mockRejectedValue(erroDaApi(403, { mensagem: "Essa lista é de outra pessoa." }));
        entrarComo("Larissa Souza");
        abrir("/listas/5/palavras");

        expect((await screen.findByRole("alert")).textContent).toBe("Essa lista é de outra pessoa.");
        expect(screen.queryByRole("link", { name: "Nova palavra" })).toBeNull();
    });
});
