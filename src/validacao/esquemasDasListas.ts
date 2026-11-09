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
