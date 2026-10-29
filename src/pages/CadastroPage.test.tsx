import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, erroDaApi, erroDeRede } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { post: vi.fn() } }));
const post = vi.mocked(api.post);

type Dados = {
    nome: string;
    email: string;
    cpf: string;
    senha: string;
    confirmacao: string;
};

const LARISSA: Dados = {
    nome: "Larissa Souza",
    email: "larissa@exemplo.com",
    cpf: "52998224725",
    senha: "Hangdle#2026",
    confirmacao: "Hangdle#2026",
};

async function preencher(usuario: UserEvent, dados: Dados = LARISSA) {
    await usuario.type(screen.getByLabelText("Nome"), dados.nome);
    await usuario.type(screen.getByLabelText("E-mail"), dados.email);
    await usuario.type(screen.getByLabelText("CPF"), dados.cpf);
    await usuario.type(screen.getByLabelText("Senha"), dados.senha);
    await usuario.type(screen.getByLabelText("Repita a senha"), dados.confirmacao);
}

function valorDo(rotulo: string): string {
    const campo = screen.getByLabelText(rotulo);
    return campo instanceof HTMLInputElement ? campo.value : "";
}

describe("tela de cadastro", () => {
    beforeEach(() => {
        post.mockReset();
    });

    it("aponta cada campo vazio e não chama a API", async () => {
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("Informe o nome.")).toBeTruthy();
        expect(screen.getByText("Informe o e-mail.")).toBeTruthy();
        expect(screen.getByText("Informe o CPF.")).toBeTruthy();
        expect(screen.getByText("Informe a senha.")).toBeTruthy();
        expect(screen.getByText("Repita a senha.")).toBeTruthy();
        expect(document.activeElement).toBe(screen.getByLabelText("Nome"));
    });

    it("põe a máscara no CPF enquanto a pessoa digita", async () => {
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await usuario.type(screen.getByLabelText("CPF"), "52998224725");

        expect(valorDo("CPF")).toBe("529.982.247-25");
    });

    it("recusa CPF com dígito verificador errado sem chamar a API", async () => {
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await preencher(usuario, { ...LARISSA, cpf: "52998224724" });
        await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("CPF inválido. Confira os 11 números.")).toBeTruthy();
    });

    it("recusa senhas diferentes sem chamar a API", async () => {
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await preencher(usuario, { ...LARISSA, confirmacao: "Hangdle#2025" });
        await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("As senhas não são iguais.")).toBeTruthy();
    });

    it("recusa senha fraca dizendo o que falta", async () => {
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await preencher(usuario, { ...LARISSA, senha: "hangdle2026", confirmacao: "hangdle2026" });
        await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("A senha precisa ter: uma letra maiúscula, um símbolo, como ! @ # $ %.")).toBeTruthy();
    });

    it("envia só nome, e-mail, CPF e senha e leva para o login com o e-mail preenchido", async () => {
        post.mockResolvedValueOnce({ status: 201, data: { id: 1, nome: "Larissa Souza", email: "larissa@exemplo.com" } });
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await preencher(usuario);
        await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(post).toHaveBeenCalledTimes(1);
        expect(post).toHaveBeenCalledWith("/usuarios", {
            nome: "Larissa Souza",
            email: "larissa@exemplo.com",
            cpf: "529.982.247-25",
            senha: "Hangdle#2026",
        });
        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeTruthy();
        expect(screen.getByRole("status").textContent).toBe("Conta criada. Agora entre com seu e-mail e senha.");
        expect(valorDo("E-mail")).toBe("larissa@exemplo.com");
    });

    it("e-mail já cadastrado: mostra a recusa do banco no aviso e no campo, e fica na tela", async () => {
        post.mockRejectedValueOnce(erroDaApi(409, { mensagem: "Este e-mail já está cadastrado.", campos: { email: "Este e-mail já está cadastrado." } }));
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await preencher(usuario);
        await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

        expect((await screen.findByRole("alert")).textContent).toBe("Este e-mail já está cadastrado.");
        expect(screen.getAllByText("Este e-mail já está cadastrado.")).toHaveLength(2);
        expect(screen.getByRole("heading", { name: "Criar conta" })).toBeTruthy();
        expect(document.activeElement).toBe(screen.getByLabelText("E-mail"));
    });

    it("CPF já cadastrado: aponta o campo CPF", async () => {
        post.mockRejectedValueOnce(erroDaApi(409, { mensagem: "Este CPF já está cadastrado.", campos: { cpf: "Este CPF já está cadastrado." } }));
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await preencher(usuario);
        await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

        await screen.findByRole("alert");
        expect(screen.getByLabelText("CPF").getAttribute("aria-invalid")).toBe("true");
    });

    it("servidor fora do ar: avisa em português e não sai da tela", async () => {
        post.mockRejectedValueOnce(erroDeRede());
        const usuario = userEvent.setup();
        abrir("/cadastro");

        await preencher(usuario);
        await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

        expect((await screen.findByRole("alert")).textContent).toBe("Não foi possível falar com o servidor. Confira sua conexão e tente de novo.");
        expect(screen.getByRole("heading", { name: "Criar conta" })).toBeTruthy();
    });
});
