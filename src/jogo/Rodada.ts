import { ehLetra, letraBase } from "./letras";
import { NIVEIS, type Nivel } from "./niveis";
import type { PalavraDaRodada } from "./palavras";

export type EstadoRodada = "jogando" | "acertou" | "sem_vidas" | "tempo_esgotado";

export type ResultadoChute = "acerto" | "erro" | "repetida" | "invalida" | "encerrada";

export type Casa = {
    caractere: string;
    tipo: "letra" | "separador";
    revelada: boolean;
};

// Rubrica de Tech Forge - Encapsulamento e Proteção do Estado - Modificadores de acesso (private, protected, public) ou campos privados nativos (#field)
export class Rodada {
    readonly #palavra: PalavraDaRodada;
    readonly #nivel: Nivel;
    readonly #agora: () => number;
    readonly #inicio: number;
    readonly #chutes = new Set<string>();
    #erros = 0;
    #estado: EstadoRodada = "jogando";
    #segundosRestantesNoFim: number | null = null;

    // Rubrica de Tech Forge - Encapsulamento e Proteção do Estado - Construtores limpos com a devida inicialização das propriedades
    constructor(palavra: PalavraDaRodada, agora: () => number = Date.now) {
        this.#palavra = palavra;
        this.#nivel = NIVEIS[palavra.nivel];
        this.#agora = agora;
        this.#inicio = agora();
    }

    chutar(tecla: string): ResultadoChute {
        this.atualizarTempo();
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
                this.#encerrar("acertou");
            }
            return "acerto";
        }

        this.#erros += 1;
        if (this.#erros >= this.#nivel.vidas) {
            this.#encerrar("sem_vidas");
        }
        return "erro";
    }

    atualizarTempo(): void {
        if (this.#estado === "jogando" && this.#milissegundosCorridos() >= this.#nivel.segundos * 1000) {
            this.#encerrar("tempo_esgotado");
        }
    }

    // Rubrica de Tech Forge - Acesso Controlado e Propriedades - get / set apenas onde existe validação, transformação ou regra de negócio
    get casas(): Casa[] {
        return [...this.#palavra.texto].map((caractere) =>
            ehLetra(caractere)
                ? { caractere, tipo: "letra", revelada: this.#chutes.has(letraBase(caractere)) }
                : { caractere, tipo: "separador", revelada: true },
        );
    }

    get vidasRestantes(): number {
        return this.#nivel.vidas - this.#erros;
    }

    get segundosRestantes(): number {
        if (this.#segundosRestantesNoFim !== null) {
            return this.#segundosRestantesNoFim;
        }
        const restante = this.#nivel.segundos * 1000 - this.#milissegundosCorridos();
        return Math.max(0, Math.floor(restante / 1000));
    }

    get segundosGastos(): number {
        return this.#nivel.segundos - this.segundosRestantes;
    }

    get letrasCertas(): string[] {
        const daPalavra = this.#letrasDaPalavra();
        return [...this.#chutes].filter((letra) => daPalavra.has(letra));
    }

    get letrasErradas(): string[] {
        const daPalavra = this.#letrasDaPalavra();
        return [...this.#chutes].filter((letra) => !daPalavra.has(letra));
    }

    get erros(): number {
        return this.#erros;
    }

    get estado(): EstadoRodada {
        return this.#estado;
    }

    get nivel(): Nivel {
        return this.#nivel;
    }

    get palavra(): PalavraDaRodada {
        return this.#palavra;
    }

    #letrasDaPalavra(): Set<string> {
        return new Set([...this.#palavra.texto].filter(ehLetra).map(letraBase));
    }

    #milissegundosCorridos(): number {
        return this.#agora() - this.#inicio;
    }

    #encerrar(estado: EstadoRodada): void {
        this.#segundosRestantesNoFim = estado === "tempo_esgotado" ? 0 : this.segundosRestantes;
        this.#estado = estado;
    }
}
