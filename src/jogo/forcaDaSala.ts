import { ehLetra, letraBase } from "./letras";
import type { Casa } from "./Rodada";

// Na sala, a palavra fica no back: ele manda cada casa com a letra, se já saiu, ou null, se ainda está escondida.
export function casasDaForca(casas: readonly (string | null)[]): Casa[] {
    return casas.map((caractere) => {
        if (caractere === null) {
            return { caractere: "", tipo: "letra", revelada: false };
        }
        return ehLetra(caractere) ? { caractere, tipo: "letra", revelada: true } : { caractere, tipo: "separador", revelada: true };
    });
}

// Para quem já sabe a palavra: quem escolheu e todos, no fim da vez.
export function casasDaPalavra(palavra: string): Casa[] {
    return casasDaForca([...palavra]);
}

export function totalDeLetras(casas: readonly (string | null)[]): number {
    return casas.filter((casa) => casa === null || ehLetra(casa)).length;
}

// Uma letra chutada está certa se abriu alguma casa (Ç e Ã abrem com C e A).
export function separarLetras(casas: readonly (string | null)[], letras: readonly string[]): { certas: string[]; erradas: string[] } {
    const abertas = new Set(casas.filter((casa): casa is string => casa !== null && ehLetra(casa)).map(letraBase));
    return {
        certas: letras.filter((letra) => abertas.has(letra)),
        erradas: letras.filter((letra) => !abertas.has(letra)),
    };
}
