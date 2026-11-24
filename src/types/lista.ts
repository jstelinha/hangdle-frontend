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

// O mesmo formato do GET /listas-prontas (src/dominio/ListaPronta.ts, no back): modelos iguais para todo mundo,
// que a pessoa copia para as próprias listas.
export type ListaPronta = {
    id: number;
    nome: string;
    totalDePalavras: number;
};
