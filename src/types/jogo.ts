export type PalavraDoDia = {
    dia: string;
    palavra: string;
    categoria: string;
};

export type EstatisticasDoDia = {
    dia: string;
    jogadores: number;
    naoAcertaram: number;
    distribuicao: { letras: number; jogadores: number }[];
};
