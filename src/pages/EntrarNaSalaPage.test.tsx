import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

const SALA = {
    id: 5,
    donoId: 9,
    nome: "Forca da turma",
    listaId: null,
    segundosPorRodada: 90,
    rodadas: 2,
    maximoDeJogadores: 6,
    privada: true,
    jogadores: 2,
    situacao: "esperando",
};
const LARISSA = { id: 4, salaId: 5, usuarioId: 7, apelido: "Lari", pontos: 0, dono: false };

function responder(sala: object = SALA) {
    get.mockImplementation((url: string) => {
        if (url === "/salas/5") {
            return Promise.resolve({ data: sala });
        }
        return Promise.resolve({ data: { itens: [LARISSA], pagina: 1, porPagina: 10, total: 1, totalDePaginas: 1 } });
    });
}

function campo(rotulo: string): HTMLInputElement {
    const elemento = screen.getByLabelText(rotulo);
    if (!(elemento instanceof HTMLInputElement)) {
        throw new Error(`${rotulo} não é um campo de texto`);
    }
    return elemento;
}

async function abrirConvite() {
    entrarComo("Larissa Souza");
    abrir("/salas/5/entrar");
    await screen.findByLabelText("Apelido");
}

describe("entrar na sala pelo link", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        responder();
    });

    it("mostra a sala e começa com o primeiro nome como apelido", async () => {
        await abrirConvite();

        expect(screen.getByRole("heading", { name: "Entrar em Forca da turma" })).toBeTruthy();
        expect(screen.getByText("2 rodadas de 90 s · com senha · Esperando jogadores")).toBeTruthy();
        expect(campo("Apelido").value).toBe("Larissa");
        expect(campo("Senha da sala").type).toBe("password");
    });

    it("pede a senha da sala, sem chamar a API", async () => {
        const usuario = userEvent.setup();
        await abrirConvite();

        await usuario.click(screen.getByRole("button", { name: "Entrar na sala" }));

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("Digite a senha da sala.")).toBeTruthy();
    });

    it("entra com o apelido e a senha e vai para a sala", async () => {
        post.mockResolvedValueOnce({ data: LARISSA });
        const usuario = userEvent.setup();
        await abrirConvite();

        await usuario.clear(campo("Apelido"));
        await usuario.type(campo("Apelido"), "Lari");
        await usuario.type(campo("Senha da sala"), "gato");
        await usuario.click(screen.getByRole("button", { name: "Entrar na sala" }));

        expect(post).toHaveBeenCalledWith("/salas/5/participantes", { apelido: "Lari", senha: "gato" });
        expect(await screen.findByText("Você entrou na sala como Lari.")).toBeTruthy();
        expect(await screen.findByRole("heading", { name: "Forca da turma" })).toBeTruthy();
    });

    it("sala sem senha não pede senha e manda null", async () => {
        responder({ ...SALA, privada: false });
        post.mockResolvedValueOnce({ data: LARISSA });
        const usuario = userEvent.setup();
        await abrirConvite();

        expect(screen.queryByLabelText("Senha da sala")).toBeNull();
        await usuario.click(screen.getByRole("button", { name: "Entrar na sala" }));

        expect(post).toHaveBeenCalledWith("/salas/5/participantes", { apelido: "Larissa", senha: null });
    });

    it("mostra no campo a senha recusada pela API", async () => {
        const errada = "Senha da sala incorreta.";
        post.mockRejectedValueOnce(erroDaApi(403, { mensagem: errada, campos: { senha: errada } }));
        const usuario = userEvent.setup();
        await abrirConvite();

        await usuario.type(campo("Senha da sala"), "rato");
        await usuario.click(screen.getByRole("button", { name: "Entrar na sala" }));

        expect((await screen.findByRole("alert")).textContent).toBe(errada);
        expect(campo("Senha da sala").getAttribute("aria-invalid")).toBe("true");
    });

    it("não deixa entrar numa sala encerrada", async () => {
        responder({ ...SALA, situacao: "encerrada" });
        entrarComo("Larissa Souza");
        abrir("/salas/5/entrar");

        expect((await screen.findByRole("alert")).textContent).toBe("Essa sala já foi encerrada.");
        expect(screen.queryByLabelText("Apelido")).toBeNull();
    });
});
