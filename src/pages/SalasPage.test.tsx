import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const apagar = vi.mocked(api.delete);

// Quem entra nos testes (entrarComo) tem o id 7.
const DA_LARISSA = {
    id: 1,
    donoId: 7,
    nome: "Forca da turma",
    listaId: 3,
    segundosPorRodada: 90,
    rodadas: 2,
    maximoDeJogadores: 6,
    privada: true,
    jogadores: 3,
    situacao: "esperando",
};
const DE_OUTRA_PESSOA = { ...DA_LARISSA, id: 2, donoId: 9, nome: "Sala do Caio", privada: false, rodadas: 1, segundosPorRodada: 45 };
const JOGANDO = { ...DA_LARISSA, id: 3, nome: "Partida rápida", situacao: "jogando" };

function pagina<T>(itens: T[]) {
    return { data: { itens, pagina: 1, porPagina: 10, total: itens.length, totalDePaginas: itens.length > 0 ? 1 : 0 } };
}

async function abrirSalas(endereco = "/salas") {
    entrarComo("Larissa Souza");
    abrir(endereco);
    return screen.findByRole("table");
}

describe("listagem das salas", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        get.mockResolvedValue(pagina([DA_LARISSA, DE_OUTRA_PESSOA, JOGANDO]));
    });

    it("é só para quem entrou", () => {
        abrir("/salas");

        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();
    });

    it("fica no menu do cabeçalho", async () => {
        await abrirSalas();
        const menu = screen.getByRole("navigation", { name: "Principal" });
        expect(within(menu).getByRole("link", { name: "Salas" }).getAttribute("aria-current")).toBe("page");
    });

    it("começa pelas salas abertas e mostra o resumo de cada uma", async () => {
        const tabela = await abrirSalas();

        expect(get).toHaveBeenCalledWith("/salas", { params: { filtro: "abertas", pagina: 1 } });
        expect(within(tabela).getByRole("link", { name: "Forca da turma" }).getAttribute("href")).toBe("/salas/1");
        expect(within(tabela).getByText("2 rodadas de 90 s · com senha · Esperando jogadores")).toBeTruthy();
        expect(within(tabela).getByText("1 rodada de 45 s · Esperando jogadores")).toBeTruthy();
        expect(within(tabela).getAllByText("3 de 6")).toHaveLength(3);
        expect(screen.getByRole("link", { name: "Abertas" }).getAttribute("aria-current")).toBe("page");
    });

    it("troca para as salas em que a pessoa está", async () => {
        const usuario = userEvent.setup();
        await abrirSalas();

        await usuario.click(screen.getByRole("link", { name: "As minhas" }));

        expect(get).toHaveBeenLastCalledWith("/salas", { params: { filtro: "minhas", pagina: 1 } });
        expect(screen.getByRole("link", { name: "As minhas" }).getAttribute("aria-current")).toBe("page");
    });

    it("só quem criou a sala edita e apaga; com a partida começada, só apaga", async () => {
        await abrirSalas();

        expect(screen.getByRole("link", { name: "Editar Forca da turma" }).getAttribute("href")).toBe("/salas/1/editar");
        expect(screen.queryByRole("link", { name: "Editar Sala do Caio" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Apagar Sala do Caio" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Editar Partida rápida" })).toBeNull();
        expect(screen.getByRole("button", { name: "Apagar Partida rápida" })).toBeTruthy();
    });

    it("apaga a sala depois de confirmar", async () => {
        apagar.mockResolvedValueOnce({ data: "" });
        const usuario = userEvent.setup();
        await abrirSalas();
        get.mockResolvedValueOnce(pagina([DE_OUTRA_PESSOA, JOGANDO]));

        await usuario.click(screen.getByRole("button", { name: "Apagar Forca da turma" }));
        await usuario.click(screen.getByRole("button", { name: "Sim, apagar" }));

        expect(apagar).toHaveBeenCalledWith("/salas/1");
        expect(await screen.findByText("A sala Forca da turma foi apagada.")).toBeTruthy();
        expect(await screen.findByText("2 salas")).toBeTruthy();
    });

    it("sem salas, convida a criar uma", async () => {
        get.mockResolvedValueOnce(pagina([]));
        entrarComo("Larissa Souza");
        abrir("/salas?filtro=minhas");

        expect(await screen.findByText(/Você ainda não está em nenhuma sala/)).toBeTruthy();
        expect(screen.getByRole("link", { name: "Criar uma sala" }).getAttribute("href")).toBe("/salas/nova");
    });
});
