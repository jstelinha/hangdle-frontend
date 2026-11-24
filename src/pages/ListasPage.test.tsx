import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { SEM_RESPOSTA } from "../api/erros";
import { abrir, entrarComo, erroDaApi, erroDeRede, esperarStatusComTexto } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const apagar = vi.mocked(api.delete);
const post = vi.mocked(api.post);

const ANIMAIS = { id: 3, nome: "Animais", totalDePalavras: 12 };
const FRUTAS = { id: 4, nome: "Frutas", totalDePalavras: 0 };

function pagina<T>(itens: T[], numero = 1, totalDePaginas = 1) {
    return { data: { itens, pagina: numero, porPagina: 10, total: itens.length + (totalDePaginas - 1) * 10, totalDePaginas } };
}

const PRONTAS = [
    { id: 1, nome: "Animais", totalDePalavras: 20 },
    { id: 3, nome: "Cores", totalDePalavras: 20 },
];

// A página busca as listas da pessoa e as listas prontas ao mesmo tempo (as prontas saem primeiro: o efeito do
// componente filho roda antes). Por isso a resposta depende do endereço, e as de /listas podem vir de uma fila.
let filaDasListas: (() => Promise<unknown>)[] = [];

function aoBuscarListas(...respostas: (() => Promise<unknown>)[]) {
    filaDasListas.push(...respostas);
}

async function abrirListas(endereco = "/listas") {
    entrarComo("Larissa Souza");
    abrir(endereco);
    return screen.findByRole("table");
}

describe("listagem das listas", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        filaDasListas = [];
        get.mockImplementation(async (url: string) => {
            if (url === "/listas-prontas") {
                return { data: { listas: PRONTAS } };
            }
            const proxima = filaDasListas.shift();
            return proxima ? proxima() : pagina([ANIMAIS, FRUTAS]);
        });
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
        expect(within(menu).getByRole("link", { name: "Salas" }).getAttribute("aria-current")).toBeNull();
    });

    it("anda pelas páginas", async () => {
        aoBuscarListas(
            async () => pagina([ANIMAIS], 2, 2),
            async () => pagina([FRUTAS], 1, 2),
        );
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
        aoBuscarListas(async () => pagina([]));
        entrarComo("Larissa Souza");
        abrir("/listas");

        expect(await screen.findByText(/Você ainda não tem listas/)).toBeTruthy();
        expect(screen.getByRole("link", { name: "Crie a primeira" }).getAttribute("href")).toBe("/listas/nova");
    });

    it("apaga depois de confirmar e busca a página de novo", async () => {
        apagar.mockResolvedValueOnce({ data: "" });
        const usuario = userEvent.setup();
        await abrirListas();
        aoBuscarListas(async () => pagina([FRUTAS]));

        await usuario.click(screen.getByRole("button", { name: "Apagar Animais" }));
        expect(apagar).not.toHaveBeenCalled();
        expect(screen.getByRole("group", { name: "Apagar Animais e as 12 palavras dela?" })).toBeTruthy();
        await usuario.click(screen.getByRole("button", { name: "Sim, apagar" }));

        expect(apagar).toHaveBeenCalledWith("/listas/3");
        const aviso = await esperarStatusComTexto();
        expect(aviso.textContent).toBe("A lista Animais foi apagada, com as palavras dela.");
        // A linha sumiu com o foco dentro: ele vai para o aviso, e não para o body.
        expect(document.activeElement).toBe(aviso);
        expect(await screen.findByText("1 lista")).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Animais" })).toBeNull();
    });

    it("a pergunta de apagar diz quantas palavras vão junto", async () => {
        const usuario = userEvent.setup();
        await abrirListas();

        await usuario.click(screen.getByRole("button", { name: "Apagar Frutas" }));

        expect(screen.getByText("Apagar Frutas?")).toBeTruthy();
    });

    it("avisa quando não deu para apagar", async () => {
        apagar.mockRejectedValueOnce(erroDaApi(404, { mensagem: "Lista não encontrada." }));
        const usuario = userEvent.setup();
        await abrirListas();

        await usuario.click(screen.getByRole("button", { name: "Apagar Animais" }));
        await usuario.click(screen.getByRole("button", { name: "Sim, apagar" }));

        const aviso = await screen.findByRole("alert");
        expect(aviso.textContent).toBe("Lista não encontrada.");
        expect(document.activeElement).toBe(aviso);
        expect(screen.getByRole("link", { name: "Animais" })).toBeTruthy();
    });

    it("avisa quando não conseguiu buscar as listas", async () => {
        aoBuscarListas(async () => {
            throw erroDeRede();
        });
        entrarComo("Larissa Souza");
        abrir("/listas");

        expect((await screen.findByRole("alert")).textContent).toBe(SEM_RESPOSTA);
    });

    it("mostra as listas prontas e adiciona uma às listas da pessoa", async () => {
        const CORES = { id: 9, nome: "Cores", totalDePalavras: 20 };
        post.mockResolvedValueOnce({ data: { ...CORES, usuarioId: 7 } });
        const usuario = userEvent.setup();
        await abrirListas();
        const prontas = within(await screen.findByRole("region", { name: "Listas prontas" }));
        expect(prontas.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Animais20 palavrasAdicionar", "Cores20 palavrasAdicionar"]);
        aoBuscarListas(async () => pagina([ANIMAIS, CORES, FRUTAS]));

        await usuario.click(prontas.getByRole("button", { name: "Adicionar Cores às suas listas" }));

        expect(post).toHaveBeenCalledWith("/listas-prontas/3/copias");
        const aviso = await esperarStatusComTexto();
        expect(aviso.textContent).toBe("A lista Cores entrou nas suas listas, com 20 palavras.");
        expect(document.activeElement).toBe(aviso);
        expect(await screen.findByRole("link", { name: "Cores" })).toBeTruthy();
    });

    it("quem já tem uma lista com o mesmo nome recebe o recado de como adicionar de novo", async () => {
        post.mockRejectedValueOnce(erroDaApi(409, { mensagem: "Você já tem uma lista com esse nome.", campos: { nome: "Você já tem uma lista com esse nome." } }));
        const usuario = userEvent.setup();
        await abrirListas();

        await usuario.click(await screen.findByRole("button", { name: "Adicionar Animais às suas listas" }));

        expect((await screen.findByRole("alert")).textContent).toBe("Você já tem uma lista chamada Animais. Para adicionar de novo, mude o nome dela.");
    });
});
