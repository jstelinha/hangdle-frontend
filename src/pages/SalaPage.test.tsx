import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const apagar = vi.mocked(api.delete);

// Quem entra nos testes (entrarComo) tem o id 7.
const SALA = {
    id: 5,
    donoId: 7,
    nome: "Forca da turma",
    listaId: 3,
    segundosPorRodada: 90,
    rodadas: 2,
    maximoDeJogadores: 6,
    privada: true,
    jogadores: 2,
    situacao: "esperando",
};
const LARISSA = { id: 1, salaId: 5, usuarioId: 7, apelido: "Larissa", pontos: 0, dono: true };
const CAIO = { id: 2, salaId: 5, usuarioId: 9, apelido: "Caio", pontos: 3, dono: false };

function pagina<T>(itens: T[]) {
    return { itens, pagina: 1, porPagina: 10, total: itens.length, totalDePaginas: 1 };
}

function responder(sala: object, jogadores: unknown[] | Error) {
    get.mockImplementation((url: string) => {
        if (url === "/salas/5") {
            return Promise.resolve({ data: sala });
        }
        if (url === "/salas/5/participantes") {
            return jogadores instanceof Error ? Promise.reject(jogadores) : Promise.resolve({ data: pagina(jogadores) });
        }
        return Promise.resolve({ data: pagina([]) });
    });
}

async function abrirSala() {
    entrarComo("Larissa Souza");
    abrir("/salas/5");
    return screen.findByRole("table");
}

describe("página da sala", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        responder(SALA, [LARISSA, CAIO]);
    });

    it("mostra os dados da sala e quem está nela", async () => {
        const tabela = await abrirSala();

        expect(await screen.findByRole("heading", { name: "Forca da turma" })).toBeTruthy();
        expect(screen.getByText("2 rodadas de 90 s")).toBeTruthy();
        expect(screen.getByText("2 de 6")).toBeTruthy();
        expect(screen.getByText("Com senha")).toBeTruthy();
        expect(within(tabela).getByText("2 jogadores")).toBeTruthy();
        expect(within(tabela).getByText("você · criou a sala")).toBeTruthy();
        expect(get).toHaveBeenCalledWith("/salas/5/participantes", { params: { pagina: 1 } });
    });

    it("cada um troca o próprio apelido; quem criou a sala não sai, mas tira os outros", async () => {
        await abrirSala();

        expect(screen.getByRole("link", { name: "Trocar apelido Larissa" }).getAttribute("href")).toBe("/salas/5/participantes/1/editar");
        expect(screen.queryByRole("button", { name: "Sair Larissa" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Trocar apelido Caio" })).toBeNull();
        expect(screen.getByRole("button", { name: "Tirar Caio" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Editar sala" }).getAttribute("href")).toBe("/salas/5/editar");
    });

    it("quem criou a sala tira alguém e a lista é buscada de novo", async () => {
        apagar.mockResolvedValueOnce({ data: "" });
        const usuario = userEvent.setup();
        await abrirSala();
        responder({ ...SALA, jogadores: 1 }, [LARISSA]);

        await usuario.click(screen.getByRole("button", { name: "Tirar Caio" }));
        await usuario.click(screen.getByRole("button", { name: "Sim, tirar" }));

        expect(apagar).toHaveBeenCalledWith("/salas/5/participantes/2");
        expect(await screen.findByText("Caio saiu da sala.")).toBeTruthy();
        expect(await screen.findByText("1 jogador")).toBeTruthy();
        expect(screen.getByText("1 de 6")).toBeTruthy();
    });

    it("quem não criou a sala pode sair dela", async () => {
        apagar.mockResolvedValueOnce({ data: "" });
        responder({ ...SALA, donoId: 9 }, [{ ...LARISSA, dono: false }, { ...CAIO, dono: true }]);
        const usuario = userEvent.setup();
        await abrirSala();

        expect(screen.queryByRole("button", { name: "Tirar Caio" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Editar sala" })).toBeNull();
        await usuario.click(screen.getByRole("button", { name: "Sair Larissa" }));
        await usuario.click(screen.getByRole("button", { name: "Sim, sair" }));

        expect(apagar).toHaveBeenCalledWith("/salas/5/participantes/1");
        expect(await screen.findByText("Você saiu da sala Forca da turma.")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Salas" })).toBeTruthy();
    });

    it("dá o link do convite para copiar", async () => {
        const usuario = userEvent.setup();
        await abrirSala();

        const convite = screen.getByLabelText("Link do convite");
        if (!(convite instanceof HTMLInputElement)) {
            throw new Error("o convite não é um campo");
        }
        expect(convite.value).toMatch(/\/salas\/5\/entrar$/);
        expect(screen.getByText("Quem entrar pelo link vai precisar da senha da sala.")).toBeTruthy();
        await usuario.click(screen.getByRole("button", { name: "Copiar link" }));

        expect(await screen.findByText("Link copiado.")).toBeTruthy();
        expect(await navigator.clipboard.readText()).toBe(convite.value);
    });

    it("quem não está na sala vê o convite para entrar", async () => {
        responder({ ...SALA, donoId: 9 }, erroDaApi(403, { mensagem: "Entre na sala para ver quem está nela." }));
        entrarComo("Larissa Souza");
        abrir("/salas/5");

        expect(await screen.findByText("Entre na sala para ver quem está nela.")).toBeTruthy();
        expect((await screen.findByRole("link", { name: "Entrar na sala" })).getAttribute("href")).toBe("/salas/5/entrar");
        expect(screen.queryByRole("table")).toBeNull();
        expect(screen.queryByLabelText("Link do convite")).toBeNull();
    });
});
