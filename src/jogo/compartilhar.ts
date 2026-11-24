import { formatarDia } from "./relogioDoDia";
import type { Rodada } from "./Rodada";

const ACERTO = "🟩";
const ERRO = "🟥";

// O texto para mandar a quem não jogou ainda: cada letra chutada, na ordem, vira um quadrado verde (estava na palavra)
// ou vermelho (não estava). A palavra não vai, para não estragar o jogo de ninguém.
export function textoDoResultado(rodada: Rodada, dia: string, categoria: string, endereco: string): string {
    const certas = new Set(rodada.letrasCertas);
    const quadrados = rodada.chutes.map((letra) => (certas.has(letra) ? ACERTO : ERRO)).join("");
    const final =
        rodada.estado === "acertou" ? `Acertei com ${rodada.erros} ${rodada.erros === 1 ? "erro" : "erros"}.` : "O boneco ficou completo.";
    return [`Hangdle ${formatarDia(dia)} · ${categoria}`, quadrados, final, endereco].join("\n");
}

export type ComoCompartilhou = "compartilhou" | "copiou" | "desistiu" | "falhou";

function ehToque(): boolean {
    return typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
}

// No celular abre o menu de compartilhar do aparelho; no computador copia o texto, que é o que a pessoa espera lá.
export async function compartilharTexto(texto: string): Promise<ComoCompartilhou> {
    if (ehToque() && typeof navigator.share === "function") {
        try {
            await navigator.share({ text: texto });
            return "compartilhou";
        } catch (erro) {
            if (erro instanceof DOMException && erro.name === "AbortError") {
                return "desistiu";
            }
        }
    }
    try {
        await navigator.clipboard.writeText(texto);
        return "copiou";
    } catch {
        return "falhou";
    }
}
