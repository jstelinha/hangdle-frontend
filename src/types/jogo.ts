export type PalavraDoDia = {
    dia: string;
    palavra: string;
    categoria: string;
};

// O mesmo formato do GET /palavra-do-dia e do POST /palavra-do-dia/letras (src/dominio/ForcaDoDia.ts, no back).
// As casas vêm com a letra, se já saiu, ou null; a palavra só vem quando a partida termina. O token leva as letras
// de antes e volta para o back com a próxima letra.
export type JogoDoDia = {
    dia: string;
    categoria: string;
    casas: (string | null)[];
    letras: string[];
    erros: number;
    acertou: boolean;
    terminou: boolean;
    palavra: string | null;
    token: string;
};

export type ResultadoDiario = PalavraDoDia & {
    letras: string[];
    chutes: number;
    erros: number;
    acertou: boolean;
};

export type EstatisticasDoDia = {
    dia: string;
    jogadores: number;
    naoAcertaram: number;
    distribuicao: { letras: number; jogadores: number }[];
};
