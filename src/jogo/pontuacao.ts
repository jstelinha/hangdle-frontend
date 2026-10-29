export const PONTOS_BASE = 100;
export const PONTOS_POR_VIDA = 15;
export const BONUS_PRIMEIRO = 30;

export type DesempenhoNaRodada = {
    acertou: boolean;
    vidasRestantes: number;
    segundosRestantes: number;
    multiplicador: number;
    primeiroAAcertar: boolean;
};

export function pontosDaRodada(desempenho: DesempenhoNaRodada): number {
    if (!desempenho.acertou) {
        return 0;
    }
    const base = PONTOS_BASE + PONTOS_POR_VIDA * desempenho.vidasRestantes + desempenho.segundosRestantes;
    return Math.round(base * desempenho.multiplicador) + (desempenho.primeiroAAcertar ? BONUS_PRIMEIRO : 0);
}
