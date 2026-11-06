import { screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));
const get = vi.mocked(api.get);
const put = vi.mocked(api.put);

const PERFIL = { id: 7, nome: "Larissa Souza", email: "larissa@exemplo.com", cpf: "52998224725" };

function campo(rotulo: string): HTMLInputElement {
    const elemento = screen.getByLabelText(rotulo);
    if (!(elemento instanceof HTMLInputElement)) {
        throw new Error(`${rotulo} não é um campo de texto`);
    }
    return elemento;
}

async function abrirPerfil() {
    entrarComo("Larissa Souza");
    abrir("/perfil");
    await screen.findByLabelText("Nome");
}

async function trocarSenha(usuario: UserEvent, senha: string, confirmacao = senha) {
    await usuario.type(campo("Senha nova"), senha);
    await usuario.type(campo("Repita a senha nova"), confirmacao);
}

describe("página de perfil", () => {
    beforeEach(() => {
        get.mockReset();
        put.mockReset();
        get.mockResolvedValue({ data: PERFIL });
    });

    it("é só para quem entrou", () => {
        abrir("/perfil");

        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();
    });

    it("mostra os dados da conta, com o e-mail travado", async () => {
        await abrirPerfil();

        expect(get).toHaveBeenCalledWith("/usuarios/7");
        expect(campo("Nome").value).toBe("Larissa Souza");
        expect(campo("CPF").value).toBe("529.982.247-25");
        expect(campo("E-mail").value).toBe("larissa@exemplo.com");
        expect(campo("E-mail").readOnly).toBe(true);
        expect(screen.getByText("O e-mail não pode ser alterado.")).toBeTruthy();
    });

    it("exige a senha nova e a confirmação, sem chamar a API", async () => {
        const usuario = userEvent.setup();
        await abrirPerfil();

        await usuario.click(screen.getByRole("button", { name: "Salvar" }));

        expect(put).not.toHaveBeenCalled();
        expect(screen.getByText("Informe a senha.")).toBeTruthy();
        expect(screen.getByText("Repita a senha.")).toBeTruthy();
    });

    it.each([
        ["CPF inválido", { cpf: "52998224724" }, "CPF inválido. Confira os 11 números."],
        ["senha fraca", { senha: "forca2027" }, "A senha precisa ter: uma letra maiúscula, um símbolo, como ! @ # $ %."],
        ["senhas diferentes", { confirmacao: "Forca#2028" }, "As senhas não são iguais."],
    ])("recusa %s sem chamar a API", async (_caso, troca, mensagem) => {
        const usuario = userEvent.setup();
        await abrirPerfil();
        if ("cpf" in troca) {
            await usuario.clear(campo("CPF"));
            await usuario.type(campo("CPF"), troca.cpf);
        }
        await trocarSenha(usuario, "senha" in troca ? troca.senha : "Forca#2027", "confirmacao" in troca ? troca.confirmacao : undefined);

        await usuario.click(screen.getByRole("button", { name: "Salvar" }));

        expect(put).not.toHaveBeenCalled();
        expect(screen.getByText(mensagem)).toBeTruthy();
    });

    it("salva sem mandar o e-mail e o nome novo aparece no cabeçalho", async () => {
        put.mockResolvedValueOnce({ data: { id: 7, nome: "Larissa Andrade", email: "larissa@exemplo.com" } });
        const usuario = userEvent.setup();
        await abrirPerfil();

        await usuario.clear(campo("Nome"));
        await usuario.type(campo("Nome"), "Larissa Andrade");
        await trocarSenha(usuario, "Forca#2027");
        await usuario.click(screen.getByRole("button", { name: "Salvar" }));

        expect(await screen.findByText("Seus dados foram atualizados.")).toBeTruthy();
        expect(put).toHaveBeenCalledWith("/usuarios/7", { nome: "Larissa Andrade", cpf: "529.982.247-25", senha: "Forca#2027" });
        expect(within(screen.getByRole("banner")).getByRole("link", { name: "Larissa Andrade" })).toBeTruthy();
        expect(campo("Senha nova").value).toBe("");
    });

    it("mostra no campo o CPF recusado pela API", async () => {
        put.mockRejectedValueOnce(erroDaApi(409, { mensagem: "Este CPF já está cadastrado.", campos: { cpf: "Este CPF já está cadastrado." } }));
        const usuario = userEvent.setup();
        await abrirPerfil();

        await trocarSenha(usuario, "Forca#2027");
        await usuario.click(screen.getByRole("button", { name: "Salvar" }));

        expect((await screen.findByRole("alert")).textContent).toBe("Este CPF já está cadastrado.");
        expect(campo("CPF").getAttribute("aria-invalid")).toBe("true");
    });
});
