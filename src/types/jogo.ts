export type PalavraDoDia = {
    dia: string;
    palavra: string;
    categoria: string;
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
