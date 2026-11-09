import { z } from "zod";

// As mesmas regras do back (src/esquemas/lista.ts), para avisar antes de enviar.
export const NOME_DA_LISTA = { minimo: 2, maximo: 40 };

function semEspacosSobrando(texto: string): string {
    return texto.trim().replace(/\s+/g, " ");
}

function entre(texto: string, { minimo, maximo }: { minimo: number; maximo: number }): boolean {
    return texto.length >= minimo && texto.length <= maximo;
}

// Rubrica de Front-end - Cruds Completos - Validação dos campos obrigatórios
export const esquemaLista = z.object({
    nome: z
        .string()
        .transform(semEspacosSobrando)
        .refine((nome) => nome !== "", "Informe o nome da lista.")
        .refine(
            (nome) => nome === "" || entre(nome, NOME_DA_LISTA),
            `O nome da lista precisa ter de ${NOME_DA_LISTA.minimo} a ${NOME_DA_LISTA.maximo} caracteres.`,
        ),
});

export type FormularioLista = z.input<typeof esquemaLista>;

// As mesmas regras do back (src/esquemas/palavraDaLista.ts e o CHECK de mysql/06-listas.sql).
export const PALAVRA = { minimo: 3, maximo: 30 };
export const DICA = { minimo: 2, maximo: 80 };
const FORMATO_DA_PALAVRA = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]+([ -][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]+)*$/;

export function emMaiusculas(texto: string): string {
    return texto.normalize("NFC").toLocaleUpperCase("pt-BR");
}

// Rubrica de Front-end - Cruds Completos - Validação dos campos obrigatórios
export const esquemaPalavra = z.object({
    palavra: z
        .string()
        .transform((texto) => emMaiusculas(semEspacosSobrando(texto)))
        .refine((palavra) => palavra !== "", "Informe a palavra.")
        .refine(
            (palavra) => palavra === "" || entre(palavra, PALAVRA),
            `A palavra precisa ter de ${PALAVRA.minimo} a ${PALAVRA.maximo} letras.`,
        )
        .refine((palavra) => palavra === "" || FORMATO_DA_PALAVRA.test(palavra), "Use só letras, com espaço ou hífen entre as partes."),
    dica: z
        .string()
        .transform(semEspacosSobrando)
        .refine((dica) => dica === "" || entre(dica, DICA), `A dica precisa ter de ${DICA.minimo} a ${DICA.maximo} caracteres.`)
        .transform((dica) => (dica === "" ? null : dica)),
});

export type FormularioPalavra = z.input<typeof esquemaPalavra>;
