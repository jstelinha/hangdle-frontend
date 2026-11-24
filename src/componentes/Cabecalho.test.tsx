import { screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, tokenQueExpiraEm } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

const SEM_SALAS = { data: { itens: [], pagina: 1, porPagina: 10, total: 0, totalDePaginas: 0 } };

function cabecalho() {
    return within(screen.getByRole("banner"));
}

function menu() {
    return within(screen.getByRole("navigation", { name: "Principal" }));
}

async function entrar(usuario: UserEvent) {
    post.mockResolvedValueOnce({
        status: 200,
        data: { token: tokenQueExpiraEm(3600), usuario: { id: 7, nome: "Larissa Souza", email: "larissa@exemplo.com" } },
    });
    await usuario.type(screen.getByLabelText("E-mail"), "larissa@exemplo.com");
    await usuario.type(screen.getByLabelText("Senha"), "Hangdle#2026");
    await usuario.click(within(screen.getByRole("main")).getByRole("button", { name: "Entrar" }));
}

describe("cabeçalho", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        get.mockImplementation(async (url: string) => (url === "/salas" ? SEM_SALAS : { data: { resultados: [] } }));
    });

    it("o logotipo é o caminho para o jogo", () => {
        abrir("/login");

        const logotipo = cabecalho().getByRole("link", { name: "Hangdle" });
        expect(logotipo.getAttribute("href")).toBe("/jogo");
        expect(cabecalho().queryByRole("link", { name: "Jogar" })).toBeNull();
    });

    it("quem tem conta vê tudo numa linha: as telas da conta, o nome e o sair", () => {
        entrarComo("Larissa Souza");
        abrir("/login");

        expect(menu().getByRole("link", { name: "Salas" }).getAttribute("href")).toBe("/salas");
        expect(menu().getByRole("link", { name: "Listas" })).toBeTruthy();
        expect(menu().getByRole("link", { name: "Estatísticas" })).toBeTruthy();
        expect(cabecalho().getByRole("link", { name: "Larissa Souza" }).getAttribute("href")).toBe("/perfil");
        expect(cabecalho().getByRole("button", { name: "Sair" })).toBeTruthy();
    });

    it("visitante vê só as salas e o entrar", () => {
        abrir("/login");

        expect(menu().getByRole("button", { name: "Salas" })).toBeTruthy();
        expect(cabecalho().getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
        expect(cabecalho().queryByRole("link", { name: "Criar conta" })).toBeNull();
        expect(menu().queryByRole("link", { name: "Listas" })).toBeNull();
        expect(menu().queryByRole("link", { name: "Estatísticas" })).toBeNull();
    });

    it("visitante que clica em salas é convidado a entrar para jogar online", async () => {
        const usuario = userEvent.setup();
        abrir("/login");

        await usuario.click(menu().getByRole("button", { name: "Salas" }));

        const recado = within(screen.getByRole("dialog", { name: "Faça login para jogar online" }));
        expect(recado.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
        expect(recado.getByRole("link", { name: "Criar conta" }).getAttribute("href")).toBe("/cadastro");

        await usuario.click(recado.getByRole("button", { name: "Fechar" }));

        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("entrar pelo recado das salas leva para as salas depois do login", async () => {
        const usuario = userEvent.setup();
        abrir("/jogo");
        await usuario.click(menu().getByRole("button", { name: "Salas" }));

        await usuario.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Entrar" }));
        expect(screen.getByRole("status").textContent).toBe("Faça login para jogar online.");
        await entrar(usuario);

        expect(await screen.findByRole("heading", { name: "Salas" })).toBeTruthy();
    });

    it("um link de sala aberto sem login volta para ele depois do login", async () => {
        const usuario = userEvent.setup();
        abrir("/salas?filtro=minhas");

        expect(screen.getByRole("status").textContent).toBe("Faça login para jogar online.");
        await entrar(usuario);

        expect(await screen.findByRole("heading", { name: "Salas" })).toBeTruthy();
        expect(get).toHaveBeenCalledWith("/salas", { params: { filtro: "minhas", pagina: 1 } });
    });
});
