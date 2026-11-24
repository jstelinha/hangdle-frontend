import { ehLetra, letraBase } from "./letras";

export const ERROS_PARA_PERDER = 6;

export type EstadoRodada = "jogando" | "acertou" | "perdeu";

export type ResultadoChute = "acerto" | "erro" | "repetida" | "invalida" | "encerrada";

export type Casa = {
    caractere: string;
    tipo: "letra" | "separador";
    revelada: boolean;
};

// Rubrica de Tech Forge - Encapsulamento e Proteção do Estado - Modificadores de acesso (private, protected, public) ou campos privados nativos (#field)
export class Rodada {
    readonly #palavra: string;
    readonly #chutes = new Set<string>();
    #erros = 0;
    #estado: EstadoRodada = "jogando";

    // Rubrica de Tech Forge - Encapsulamento e Proteção do Estado - Construtores limpos com a devida inicialização das propriedades
    constructor(palavra: string) {
        this.#palavra = palavra;
    }

    static aPartirDosChutes(palavra: string, chutes: readonly string[]): Rodada {
        const rodada = new Rodada(palavra);
        for (const letra of chutes) {
            rodada.chutar(letra);
        }
        return rodada;
    }

    chutar(tecla: string): ResultadoChute {
        if (this.#estado !== "jogando") {
            return "encerrada";
        }

        const letra = letraBase(tecla);
        if (!/^[A-Z]$/.test(letra)) {
            return "invalida";
        }
        if (this.#chutes.has(letra)) {
            return "repetida";
        }

        this.#chutes.add(letra);
        if (this.#letrasDaPalavra().has(letra)) {
            if (this.casas.every((casa) => casa.revelada)) {
                this.#estado = "acertou";
            }
            return "acerto";
        }

        this.#erros += 1;
        if (this.#erros >= ERROS_PARA_PERDER) {
            this.#estado = "perdeu";
        }
        return "erro";
    }

    // Rubrica de Tech Forge - Acesso Controlado e Propriedades - get / set apenas onde existe validação, transformação ou regra de negócio
    get casas(): Casa[] {
        return [...this.#palavra].map((caractere) =>
            ehLetra(caractere)
                ? { caractere, tipo: "letra", revelada: this.#chutes.has(letraBase(caractere)) }
                : { caractere, tipo: "separador", revelada: true },
        );
    }

    get chutes(): string[] {
        return [...this.#chutes];
    }

    get letrasCertas(): string[] {
        const daPalavra = this.#letrasDaPalavra();
        return this.chutes.filter((letra) => daPalavra.has(letra));
    }

    get letrasErradas(): string[] {
        const daPalavra = this.#letrasDaPalavra();
        return this.chutes.filter((letra) => !daPalavra.has(letra));
    }

    get erros(): number {
        return this.#erros;
    }

    get estado(): EstadoRodada {
        return this.#estado;
    }

    get palavra(): string {
        return this.#palavra;
    }

    #letrasDaPalavra(): Set<string> {
        return new Set([...this.#palavra].filter(ehLetra).map(letraBase));
    }
}
