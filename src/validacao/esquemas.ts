import { z } from "zod";
import { cpfValido } from "./cpf";
import { emailValido } from "./email";
import { mensagemSenhaFraca, senhaForte } from "./senha";

const email = z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .refine(emailValido, "Digite um e-mail válido, como nome@exemplo.com.");

// Rubrica de Exigência - zod
// Rubrica de Front-end - Cadastro de Usuário - Campos obrigatórios: nome, email, senha, CPF
export const esquemaCadastro = z
    .object({
        nome: z
            .string()
            .trim()
            .min(1, "Informe o nome.")
            .refine((nome) => nome.replace(/\s+/g, " ").length >= 3 && nome.length <= 100 && /\p{L}/u.test(nome), "O nome precisa ter de 3 a 100 caracteres."),
        email,
        cpf: z.string().trim().min(1, "Informe o CPF.").refine(cpfValido, "CPF inválido. Confira os 11 números."),
        senha: z
            .string()
            .min(1, "Informe a senha.")
            .superRefine((senha, contexto) => {
                if (senha.length > 0 && !senhaForte(senha)) {
                    contexto.addIssue({ code: "custom", message: mensagemSenhaFraca(senha) });
                }
            }),
        confirmacaoSenha: z.string().min(1, "Repita a senha."),
    })
    // Rubrica de Front-end - Cadastro de Usuário - Verificação dupla de senha
    .refine((dados) => dados.confirmacaoSenha === "" || dados.senha === dados.confirmacaoSenha, {
        path: ["confirmacaoSenha"],
        message: "As senhas não são iguais.",
    });

export const esquemaLogin = z.object({
    email,
    senha: z.string().min(1, "Informe a senha."),
});

export type FormularioCadastro = z.infer<typeof esquemaCadastro>;
export type FormularioLogin = z.infer<typeof esquemaLogin>;
export type ErrosDoFormulario<T> = Partial<Record<keyof T, string>>;

export function errosDoFormulario<T extends z.ZodType>(esquema: T, valores: unknown): ErrosDoFormulario<z.infer<T>> {
    const resultado = esquema.safeParse(valores);
    if (resultado.success) {
        return {};
    }
    const erros: Record<string, string> = {};
    for (const problema of resultado.error.issues) {
        const campo = problema.path[0];
        if (typeof campo === "string" && !(campo in erros)) {
            erros[campo] = problema.message;
        }
    }
    return erros as ErrosDoFormulario<z.infer<T>>;
}
