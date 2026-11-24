import { ERROS_PARA_PERDER } from "./Rodada";

export const BONECO_COMPLETO = "Boneco completo";

export type PartidaPorErros = {
    acertou: boolean;
    erros: number;
};

export type LinhaDeErros = {
    rotulo: string;
    nome: string;
    quantidade: number;
    destaque: boolean;
};

function nomeDosErros(erros: number): string {
    return erros === 1 ? "1 erro" : `${erros} erros`;
}

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Desenvolver métricas adequadas aos objetivos de negócio
// Na forca, quem acerta acerta com 0 a 5 erros; no sexto, o boneco fica completo. São sempre as mesmas 7 linhas, e por
// isso dá para comparar um dia com outro, o que não acontece com as letras chutadas (dependem do tamanho da palavra).
export function distribuicaoDeErros(partidas: readonly PartidaPorErros[], destaque?: PartidaPorErros): LinhaDeErros[] {
    const linhas: LinhaDeErros[] = [];
    for (let erros = 0; erros < ERROS_PARA_PERDER; erros += 1) {
        linhas.push({
            rotulo: String(erros),
            nome: nomeDosErros(erros),
            quantidade: partidas.filter((partida) => partida.acertou && partida.erros === erros).length,
            destaque: destaque?.acertou === true && destaque.erros === erros,
        });
    }
    linhas.push({
        rotulo: "☠",
        nome: BONECO_COMPLETO,
        quantidade: partidas.filter((partida) => !partida.acertou).length,
        destaque: destaque?.acertou === false,
    });
    return linhas;
}
