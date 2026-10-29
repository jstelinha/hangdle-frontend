import { describe, expect, it } from "vitest";
import { cpfValido, formatarCpf } from "./cpf";
import { emailValido } from "./email";
import { errosDoFormulario, esquemaCadastro } from "./esquemas";
import { senhaForte } from "./senha";

const VALIDO = {
    nome: "Larissa Souza",
    email: "larissa@exemplo.com",
    cpf: "529.982.247-25",
    senha: "Hangdle#2026",
    confirmacaoSenha: "Hangdle#2026",
};

describe("CPF", () => {
    it.each(["529.982.247-25", "52998224725", "111.444.777-35"])("aceita %s", (cpf) => {
        expect(cpfValido(cpf)).toBe(true);
    });

    it.each(["529.982.247-24", "529.982.247-15", "111.111.111-11", "5299822472", "529.982.247-2a"])("recusa %s", (cpf) => {
        expect(cpfValido(cpf)).toBe(false);
    });

    it.each([
        ["529", "529"],
        ["5299", "529.9"],
        ["5299822", "529.982.2"],
        ["5299822472", "529.982.247-2"],
        ["52998224725", "529.982.247-25"],
        ["529982247259999", "529.982.247-25"],
        ["529.982.247-25", "529.982.247-25"],
    ])("máscara: %s vira %s", (digitado, esperado) => {
        expect(formatarCpf(digitado)).toBe(esperado);
    });
});

describe("e-mail e senha", () => {
    it("e-mail", () => {
        expect(emailValido("larissa@exemplo.com")).toBe(true);
        expect(emailValido("larissa@exemplo")).toBe(false);
    });

    it("senha", () => {
        expect(senhaForte("Hangdle#2026")).toBe(true);
        expect(senhaForte("hangdle#2026")).toBe(false);
    });
});

describe("formulário de cadastro", () => {
    it("sem erros quando tudo está certo", () => {
        expect(errosDoFormulario(esquemaCadastro, VALIDO)).toEqual({});
    });

    it("todos os campos são obrigatórios", () => {
        expect(errosDoFormulario(esquemaCadastro, { nome: "", email: "", cpf: "", senha: "", confirmacaoSenha: "" })).toEqual({
            nome: "Informe o nome.",
            email: "Informe o e-mail.",
            cpf: "Informe o CPF.",
            senha: "Informe a senha.",
            confirmacaoSenha: "Repita a senha.",
        });
    });

    it("a confirmação tem que ser igual à senha", () => {
        expect(errosDoFormulario(esquemaCadastro, { ...VALIDO, confirmacaoSenha: "Hangdle#2025" })).toEqual({
            confirmacaoSenha: "As senhas não são iguais.",
        });
    });

    it("explica o que falta na senha", () => {
        expect(errosDoFormulario(esquemaCadastro, { ...VALIDO, senha: "hangdle2026", confirmacaoSenha: "hangdle2026" })).toEqual({
            senha: "A senha precisa ter: uma letra maiúscula, um símbolo, como ! @ # $ %.",
        });
    });
});
