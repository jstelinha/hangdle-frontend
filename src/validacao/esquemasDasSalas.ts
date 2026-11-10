import { z } from "zod";
import { SEGUNDOS_POR_RODADA, type DadosSala } from "../types/sala";
import { textoObrigatorio } from "./texto";

// As mesmas regras do back (src/esquemas/sala.ts e src/esquemas/participante.ts).
export const NOME_DA_SALA = { minimo: 2, maximo: 40 };
export const RODADAS = { minimo: 1, maximo: 5 };
export const JOGADORES = { minimo: 2, maximo: 10 };
export const SENHA_DA_SALA = { minimo: 4, maximo: 30 };
export const APELIDO = { minimo: 2, maximo: 20 };

const SENHA_COM_TAMANHO_ERRADO = `A senha da sala precisa ter de ${SENHA_DA_SALA.minimo} a ${SENHA_DA_SALA.maximo} caracteres.`;

function inteiroEntre({ minimo, maximo }: { minimo: number; maximo: number }, mensagem: string) {
    return z
        .string()
        .transform(Number)
        .refine((numero) => Number.isInteger(numero) && numero >= minimo && numero <= maximo, mensagem);
}

function tamanhoDaSenha(senha: string): number {
    return [...senha].length;
}

// Sala pública não tem senha. Sala com senha precisa de uma; na edição de uma sala que já tinha
// senha, deixar o campo vazio mantém a senha atual (o campo nem vai para o back).
// Rubrica de Front-end - Cruds Completos - Validação dos campos obrigatórios
export function esquemaSala(jaTemSenha: boolean) {
    return z
        .object({
            nome: textoObrigatorio(
                NOME_DA_SALA,
                "Informe o nome da sala.",
                `O nome da sala precisa ter de ${NOME_DA_SALA.minimo} a ${NOME_DA_SALA.maximo} caracteres.`,
            ),
            listaId: z.string().transform((valor) => (valor === "" ? null : Number(valor))),
            segundosPorRodada: z
                .string()
                .transform(Number)
                .pipe(z.literal(SEGUNDOS_POR_RODADA, { error: "Escolha 45, 90 ou 120 segundos por rodada." })),
            rodadas: inteiroEntre(RODADAS, `Escolha de ${RODADAS.minimo} a ${RODADAS.maximo} rodadas.`),
            maximoDeJogadores: inteiroEntre(JOGADORES, `Escolha de ${JOGADORES.minimo} a ${JOGADORES.maximo} jogadores.`),
            acesso: z.enum(["publica", "privada"]),
            senha: z.string(),
        })
        .refine(({ acesso, senha }) => acesso === "publica" || senha !== "" || jaTemSenha, {
            path: ["senha"],
            message: "Escolha a senha da sala.",
            when: () => true,
        })
        .refine(
            ({ acesso, senha }) =>
                acesso === "publica" || senha === "" || (tamanhoDaSenha(senha) >= SENHA_DA_SALA.minimo && tamanhoDaSenha(senha) <= SENHA_DA_SALA.maximo),
            { path: ["senha"], message: SENHA_COM_TAMANHO_ERRADO, when: () => true },
        )
        .transform(({ acesso, senha, ...configuracao }): DadosSala => {
            if (acesso === "publica") {
                return { ...configuracao, senha: null };
            }
            return senha === "" ? configuracao : { ...configuracao, senha };
        });
}

export type FormularioSala = z.input<ReturnType<typeof esquemaSala>>;

const apelido = textoObrigatorio(APELIDO, "Escolha um apelido.", `O apelido precisa ter de ${APELIDO.minimo} a ${APELIDO.maximo} caracteres.`);

// Rubrica de Front-end - Cruds Completos - Validação dos campos obrigatórios
export function esquemaEntrada(salaComSenha: boolean) {
    return z.object({
        apelido,
        senha: z
            .string()
            .refine((senha) => !salaComSenha || senha !== "", "Digite a senha da sala.")
            .transform((senha) => (salaComSenha ? senha : null)),
    });
}

export const esquemaApelido = z.object({ apelido });

export type FormularioEntrada = z.input<ReturnType<typeof esquemaEntrada>>;
export type FormularioApelido = z.input<typeof esquemaApelido>;
