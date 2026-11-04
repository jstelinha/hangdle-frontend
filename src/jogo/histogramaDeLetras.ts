import type { ResultadoDiario } from "../types/jogo";

export const NAO_ACERTOU = "Não acertou";

export type ContagemPorLetras = {
    distribuicao: { letras: number; jogadores: number }[];
    naoAcertaram: number;
};

export type SeuResultado = {
    acertou: boolean;
    chutes: number;
};

export type ColunaDeLetras = {
    rotulo: string;
    quantidade: number;
    destaque: boolean;
};

function ehDestaque(destaque: SeuResultado | undefined, acertou: boolean, letras?: number): boolean {
    return destaque !== undefined && destaque.acertou === acertou && (letras === undefined || destaque.chutes === letras);
}

export function colunasPorLetras(contagem: ContagemPorLetras, destaque?: SeuResultado): ColunaDeLetras[] {
    const porLetras = new Map(contagem.distribuicao.map((faixa) => [faixa.letras, faixa.jogadores]));
    if (destaque?.acertou && !porLetras.has(destaque.chutes)) {
        porLetras.set(destaque.chutes, 0);
    }
    const letras = [...porLetras.keys()];
    const colunas: ColunaDeLetras[] = [];

    if (letras.length > 0) {
        for (let total = Math.min(...letras); total <= Math.max(...letras); total += 1) {
            colunas.push({ rotulo: `${total} letras`, quantidade: porLetras.get(total) ?? 0, destaque: ehDestaque(destaque, true, total) });
        }
    }

    colunas.push({ rotulo: NAO_ACERTOU, quantidade: contagem.naoAcertaram, destaque: ehDestaque(destaque, false) });
    return colunas;
}

export function somarResultado(contagem: ContagemPorLetras, seu: SeuResultado): ContagemPorLetras {
    if (!seu.acertou) {
        return { ...contagem, naoAcertaram: contagem.naoAcertaram + 1 };
    }
    const jaTem = contagem.distribuicao.some((faixa) => faixa.letras === seu.chutes);
    return {
        ...contagem,
        distribuicao: jaTem
            ? contagem.distribuicao.map((faixa) => (faixa.letras === seu.chutes ? { ...faixa, jogadores: faixa.jogadores + 1 } : faixa))
            : [...contagem.distribuicao, { letras: seu.chutes, jogadores: 1 }],
    };
}

export function contagemDoHistorico(resultados: ResultadoDiario[]): ContagemPorLetras {
    return resultados.reduce<ContagemPorLetras>((contagem, resultado) => somarResultado(contagem, resultado), {
        distribuicao: [],
        naoAcertaram: 0,
    });
}
