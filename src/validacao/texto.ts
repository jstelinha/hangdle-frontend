import { z } from "zod";

export type Limites = {
    minimo: number;
    maximo: number;
};

export function semEspacosSobrando(texto: string): string {
    return texto.trim().replace(/\s+/g, " ");
}

export function entre(texto: string, { minimo, maximo }: Limites): boolean {
    return texto.length >= minimo && texto.length <= maximo;
}

// Um texto obrigatório, sem os espaços sobrando, com um tamanho mínimo e máximo.
export function textoObrigatorio(limites: Limites, vazio: string, tamanhoErrado: string) {
    return z
        .string()
        .transform(semEspacosSobrando)
        .refine((texto) => texto !== "", vazio)
        .refine((texto) => texto === "" || entre(texto, limites), tamanhoErrado);
}
