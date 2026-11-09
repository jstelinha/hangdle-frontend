export type Lista = {
    id: number;
    nome: string;
    totalDePalavras: number;
};

export type DadosLista = {
    nome: string;
};

export type PalavraDaLista = {
    id: number;
    listaId: number;
    palavra: string;
    dica: string | null;
};

export type DadosPalavra = {
    palavra: string;
    dica: string | null;
};
