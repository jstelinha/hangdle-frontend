import type { EstatisticasDoDia } from "../types/jogo";

export const NAO_ACERTOU = "Não acertou";

export type SeuResultado = {
    acertou: boolean;
    chutes: number;
};

export type ColunaDoDia = {
    rotulo: string;
    jogadores: number;
    suaColuna: boolean;
};

function contagemPorLetras(estatisticas: EstatisticasDoDia, seu: SeuResultado, somarSeu: boolean): Map<number, number> {
    const contagem = new Map(estatisticas.distribuicao.map((faixa) => [faixa.letras, faixa.jogadores]));
    if (seu.acertou) {
        contagem.set(seu.chutes, (contagem.get(seu.chutes) ?? 0) + (somarSeu ? 1 : 0));
    }
    return contagem;
}

export function colunasDoDia(estatisticas: EstatisticasDoDia, seu: SeuResultado, { somarSeu }: { somarSeu: boolean }): ColunaDoDia[] {
    const contagem = contagemPorLetras(estatisticas, seu, somarSeu);
    const letras = [...contagem.keys()];
    const colunas: ColunaDoDia[] = [];

    if (letras.length > 0) {
        for (let total = Math.min(...letras); total <= Math.max(...letras); total += 1) {
            colunas.push({
                rotulo: `${total} letras`,
                jogadores: contagem.get(total) ?? 0,
                suaColuna: seu.acertou && seu.chutes === total,
            });
        }
    }

    colunas.push({
        rotulo: NAO_ACERTOU,
        jogadores: estatisticas.naoAcertaram + (!seu.acertou && somarSeu ? 1 : 0),
        suaColuna: !seu.acertou,
    });
    return colunas;
}
