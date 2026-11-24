import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./axios";
import { listas, palavrasDaLista } from "./listas";
import { participantesDaSala, salas } from "./salas";

vi.mock("./axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);
const put = vi.mocked(api.put);
const apagar = vi.mocked(api.delete);

const LISTA = { id: 3, nome: "Animais", totalDePalavras: 2 };

describe("rotas de um CRUD do back", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("lista uma página", async () => {
        const pagina = { itens: [LISTA], pagina: 2, porPagina: 10, total: 11, totalDePaginas: 2 };
        get.mockResolvedValueOnce({ data: pagina });

        expect(await listas.listar(2)).toEqual(pagina);
        expect(get).toHaveBeenCalledWith("/listas", { params: { pagina: 2 } });
    });

    it("busca, cria, edita e apaga pelo id", async () => {
        get.mockResolvedValueOnce({ data: LISTA });
        post.mockResolvedValueOnce({ data: LISTA });
        put.mockResolvedValueOnce({ data: LISTA });
        apagar.mockResolvedValueOnce({ data: "" });

        expect(await listas.buscar(3)).toEqual(LISTA);
        expect(await listas.criar({ nome: "Animais" })).toEqual(LISTA);
        expect(await listas.editar(3, { nome: "Bichos" })).toEqual(LISTA);
        await listas.apagar(3);

        expect(get).toHaveBeenCalledWith("/listas/3");
        expect(post).toHaveBeenCalledWith("/listas", { nome: "Animais" });
        expect(put).toHaveBeenCalledWith("/listas/3", { nome: "Bichos" });
        expect(apagar).toHaveBeenCalledWith("/listas/3");
    });

    it("manda os filtros junto com a página", async () => {
        get.mockResolvedValueOnce({ data: {} });

        await salas.listar(3, { filtro: "minhas" });

        expect(get).toHaveBeenCalledWith("/salas", { params: { filtro: "minhas", pagina: 3 } });
    });

    it("põe os participantes dentro da sala", async () => {
        post.mockResolvedValueOnce({ data: {} });

        await participantesDaSala(5).criar({ apelido: "Lari", senha: "gato" });

        expect(post).toHaveBeenCalledWith("/salas/5/participantes", { apelido: "Lari", senha: "gato" });
    });

    it("põe as palavras dentro da lista", async () => {
        put.mockResolvedValueOnce({ data: {} });

        await palavrasDaLista(3).editar(8, { palavra: "GATO", dica: null });

        expect(put).toHaveBeenCalledWith("/listas/3/palavras/8", { palavra: "GATO", dica: null });
    });
});
