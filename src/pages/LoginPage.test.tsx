import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { CHAVE_CHUTES_DO_DIA } from "../jogo/chutesDoDia";
import { abrir, erroDaApi, erroDeRede, tokenQueExpiraEm } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const post = vi.mocked(api.post);
const get = vi.mocked(api.get);

async function entrar(usuario: UserEvent, email: string, senha: string) {
    await usuario.type(screen.getByLabelText("E-mail"), email);
    await usuario.type(screen.getByLabelText("Senha"), senha);
    await usuario.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("tela de login", () => {
    beforeEach(() => {
        post.mockReset();
        get.mockResolvedValue({ data: { resultados: [] } });
    });

    it("guarda o token no localStorage e leva para a área logada", async () => {
        const token = tokenQueExpiraEm(3600);
        post.mockResolvedValueOnce({ status: 200, data: { token, usuario: { id: 7, nome: "Larissa Souza", email: "larissa@exemplo.com" } } });
        const usuario = userEvent.setup();
        abrir("/login");

        await entrar(usuario, "larissa@exemplo.com", "Hangdle#2026");

        expect(post).toHaveBeenCalledWith("/login", { email: "larissa@exemplo.com", senha: "Hangdle#2026" });
        expect(await screen.findByRole("heading", { name: "Suas estatísticas" })).toBeTruthy();
        expect(localStorage.getItem("hangdle.token")).toBe(token);
        expect(screen.getByText("Larissa Souza")).toBeTruthy();
    });

    it("e-mail ou senha errados: mostra a mensagem, não guarda nada e fica no login", async () => {
        post.mockRejectedValueOnce(erroDaApi(401, { mensagem: "E-mail ou senha incorretos.", campos: {} }));
        const usuario = userEvent.setup();
        abrir("/login");

        await entrar(usuario, "larissa@exemplo.com", "SenhaErrada#1");

        expect((await screen.findByRole("alert")).textContent).toBe("E-mail ou senha incorretos.");
        expect(localStorage.getItem("hangdle.token")).toBeNull();
        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();
    });

    it("e-mail fora do formato é recusado pela regex sem chamar a API", async () => {
        const usuario = userEvent.setup();
        abrir("/login");

        await entrar(usuario, "larissa@exemplo", "Hangdle#2026");

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("Digite um e-mail válido, como nome@exemplo.com.")).toBeTruthy();
    });

    it("muitas tentativas: repassa o aviso do servidor", async () => {
        post.mockRejectedValueOnce(erroDaApi(429, { mensagem: "Muitas tentativas seguidas. Espere 15 minutos e tente de novo." }));
        const usuario = userEvent.setup();
        abrir("/login");

        await entrar(usuario, "larissa@exemplo.com", "Hangdle#2026");

        expect((await screen.findByRole("alert")).textContent).toBe("Muitas tentativas seguidas. Espere 15 minutos e tente de novo.");
    });

    it("servidor fora do ar: avisa em português", async () => {
        post.mockRejectedValueOnce(erroDeRede());
        const usuario = userEvent.setup();
        abrir("/login");

        await entrar(usuario, "larissa@exemplo.com", "Hangdle#2026");

        expect((await screen.findByRole("alert")).textContent).toBe("Não foi possível falar com o servidor. Confira sua conexão e tente de novo.");
    });

    it("a partida jogada antes de entrar vai para a conta", async () => {
        localStorage.setItem(CHAVE_CHUTES_DO_DIA, JSON.stringify({ dia: "2026-11-03", chutes: ["M", "A", "C"] }));
        post.mockResolvedValueOnce({ status: 200, data: { token: tokenQueExpiraEm(3600), usuario: { id: 7, nome: "Larissa Souza", email: "larissa@exemplo.com" } } });
        const usuario = userEvent.setup();
        abrir("/login");

        await entrar(usuario, "larissa@exemplo.com", "Hangdle#2026");

        expect(await screen.findByRole("heading", { name: "Suas estatísticas" })).toBeTruthy();
        expect(post).toHaveBeenNthCalledWith(2, "/resultados", { dia: "2026-11-03", letras: ["M", "A", "C"] });
    });

    it("se a partida guardada for recusada, entra do mesmo jeito", async () => {
        localStorage.setItem(CHAVE_CHUTES_DO_DIA, JSON.stringify({ dia: "2026-11-03", chutes: ["M"] }));
        post
            .mockResolvedValueOnce({ status: 200, data: { token: tokenQueExpiraEm(3600), usuario: { id: 7, nome: "Larissa Souza", email: "larissa@exemplo.com" } } })
            .mockRejectedValueOnce(erroDaApi(400, { mensagem: "A partida ainda não terminou." }));
        const usuario = userEvent.setup();
        abrir("/login");

        await entrar(usuario, "larissa@exemplo.com", "Hangdle#2026");

        expect(await screen.findByRole("heading", { name: "Suas estatísticas" })).toBeTruthy();
    });

    it("sair apaga a sessão e volta para o login", async () => {
        post.mockResolvedValueOnce({ status: 200, data: { token: tokenQueExpiraEm(3600), usuario: { id: 7, nome: "Larissa Souza", email: "larissa@exemplo.com" } } });
        const usuario = userEvent.setup();
        abrir("/login");
        await entrar(usuario, "larissa@exemplo.com", "Hangdle#2026");
        await screen.findByRole("heading", { name: "Suas estatísticas" });

        await usuario.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeTruthy();
        expect(localStorage.getItem("hangdle.token")).toBeNull();
        expect(localStorage.getItem("hangdle.usuario")).toBeNull();
    });
});
