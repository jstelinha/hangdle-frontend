import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const put = vi.mocked(api.put);

const SALA = {
    id: 5,
    donoId: 9,
    nome: "Forca da turma",
    listaId: null,
    segundosPorRodada: 90,
    rodadas: 2,
    maximoDeJogadores: 6,
    privada: false,
    jogadores: 2,
    situacao: "esperando",
};
const LARISSA = { id: 4, salaId: 5, usuarioId: 7, apelido: "Lari", pontos: 0, dono: false };
const CAIO = { id: 2, salaId: 5, usuarioId: 9, apelido: "Caio", pontos: 0, dono: true };

function responder() {
    get.mockImplementation((url: string) => {
        const respostas: Record<string, unknown> = {
            "/salas/5": SALA,
            "/salas/5/participantes/4": LARISSA,
            "/salas/5/participantes/2": CAIO,
            "/salas/5/participantes": { itens: [LARISSA, CAIO], pagina: 1, porPagina: 10, total: 2, totalDePaginas: 1 },
        };
        return Promise.resolve({ data: respostas[url] });
    });
}

function campoApelido(): HTMLInputElement {
    const elemento = screen.getByLabelText("Apelido");
    if (!(elemento instanceof HTMLInputElement)) {
        throw new Error("Apelido não é um campo de texto");
    }
    return elemento;
}

describe("trocar o apelido na sala", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        responder();
    });

    it("chega com o apelido atual e salva o novo", async () => {
        put.mockResolvedValueOnce({ data: { ...LARISSA, apelido: "Larissinha" } });
        const usuario = userEvent.setup();
        entrarComo("Larissa Souza");
        abrir("/salas/5/participantes/4/editar");

        expect((await screen.findByLabelText("Apelido")) instanceof HTMLInputElement).toBe(true);
        expect(campoApelido().value).toBe("Lari");
        await usuario.clear(campoApelido());
        await usuario.type(campoApelido(), "Larissinha");
        await usuario.click(screen.getByRole("button", { name: "Salvar" }));

        expect(put).toHaveBeenCalledWith("/salas/5/participantes/4", { apelido: "Larissinha" });
        expect(await screen.findByText("Agora você é Larissinha nesta sala.")).toBeTruthy();
    });

    it("exige um apelido de 2 a 20 caracteres, sem chamar a API", async () => {
        const usuario = userEvent.setup();
        entrarComo("Larissa Souza");
        abrir("/salas/5/participantes/4/editar");
        await screen.findByLabelText("Apelido");

        await usuario.clear(campoApelido());
        await usuario.click(screen.getByRole("button", { name: "Salvar" }));
        expect(screen.getByText("Escolha um apelido.")).toBeTruthy();

        await usuario.type(campoApelido(), "L");
        await usuario.click(screen.getByRole("button", { name: "Salvar" }));
        expect(screen.getByText("O apelido precisa ter de 2 a 20 caracteres.")).toBeTruthy();
        expect(put).not.toHaveBeenCalled();
    });

    it("mostra no campo o apelido repetido recusado pela API", async () => {
        const repetido = "Esse apelido já está em uso nesta sala.";
        put.mockRejectedValueOnce(erroDaApi(409, { mensagem: repetido, campos: { apelido: repetido } }));
        const usuario = userEvent.setup();
        entrarComo("Larissa Souza");
        abrir("/salas/5/participantes/4/editar");
        await screen.findByLabelText("Apelido");

        await usuario.clear(campoApelido());
        await usuario.type(campoApelido(), "Caio");
        await usuario.click(screen.getByRole("button", { name: "Salvar" }));

        expect((await screen.findByRole("alert")).textContent).toBe(repetido);
        expect(campoApelido().getAttribute("aria-invalid")).toBe("true");
    });

    it("não abre o apelido de outra pessoa", async () => {
        entrarComo("Larissa Souza");
        abrir("/salas/5/participantes/2/editar");

        expect((await screen.findByRole("alert")).textContent).toBe("Você só pode trocar o seu próprio apelido.");
        expect(screen.queryByLabelText("Apelido")).toBeNull();
    });
});
