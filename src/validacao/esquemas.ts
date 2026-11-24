import { z } from "zod";
import { cpfValido } from "./cpf";
import { emailValido } from "./email";
import { mensagemSenhaFraca, senhaForte } from "./senha";

const email = z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .refine(emailValido, "Digite um e-mail válido, como nome@exemplo.com.");

const nome = z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .refine((texto) => texto.replace(/\s+/g, " ").length >= 3 && texto.length <= 100 && /\p{L}/u.test(texto), "O nome precisa ter de 3 a 100 caracteres.");

const cpf = z.string().trim().min(1, "Informe o CPF.").refine(cpfValido, "CPF inválido. Confira os 11 números.");

const senha = z
    .string()
    .min(1, "Informe a senha.")
    .superRefine((texto, contexto) => {
        if (texto.length > 0 && !senhaForte(texto)) {
            contexto.addIssue({ code: "custom", message: mensagemSenhaFraca(texto) });
        }
    });

const confirmacaoSenha = z.string().min(1, "Repita a senha.");

const SENHAS_DIFERENTES = { path: ["confirmacaoSenha"], message: "As senhas não são iguais." };

function senhasIguais(dados: { senha: string; confirmacaoSenha: string }): boolean {
    return dados.confirmacaoSenha === "" || dados.senha === dados.confirmacaoSenha;
}

// Rubrica de Exigência - zod
// Rubrica de Front-end - Cadastro de Usuário - Campos obrigatórios: nome, email, senha, CPF
// Rubrica de Front-end - Cadastro de Usuário - Verificação dupla de senha
export const esquemaCadastro = z.object({ nome, email, cpf, senha, confirmacaoSenha }).refine(senhasIguais, SENHAS_DIFERENTES);

// Rubrica de Front-end - Edição de Usuário - Validação de CPF, validação de nível de senha e confirmação da senha
export const esquemaEdicao = z.object({ nome, cpf, senha, confirmacaoSenha }).refine(senhasIguais, SENHAS_DIFERENTES);

export const esquemaLogin = z.object({
    email,
    senha: z.string().min(1, "Informe a senha."),
});

export type FormularioCadastro = z.infer<typeof esquemaCadastro>;
export type FormularioEdicao = z.infer<typeof esquemaEdicao>;
export type FormularioLogin = z.infer<typeof esquemaLogin>;
export type ErrosDoFormulario<T> = Partial<Record<keyof T, string>>;

type Problema = { path: PropertyKey[]; message: string };

export function errosDosProblemas<T>(problemas: readonly Problema[]): ErrosDoFormulario<T> {
    const erros: Record<string, string> = {};
    for (const problema of problemas) {
        const campo = problema.path[0];
        if (typeof campo === "string" && !(campo in erros)) {
            erros[campo] = problema.message;
        }
    }
    return erros as ErrosDoFormulario<T>;
}

export function errosDoFormulario<T extends z.ZodType>(esquema: T, valores: unknown): ErrosDoFormulario<z.infer<T>> {
    const resultado = esquema.safeParse(valores);
    return resultado.success ? {} : errosDosProblemas<z.infer<T>>(resultado.error.issues);
}
