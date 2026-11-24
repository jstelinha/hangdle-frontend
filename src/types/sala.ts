// Rubrica de Tech Forge - Tipagem Avançada e Recursos do TypeScript - Tipos derivados das listas de valores (as const)
export const SEGUNDOS_POR_RODADA = [45, 90, 120] as const;
export type SegundosPorRodada = (typeof SEGUNDOS_POR_RODADA)[number];

export type SituacaoDaSala = "esperando" | "jogando" | "encerrada";

export type ConfiguracaoDaSala = {
    nome: string;
    listaId: number | null;
    segundosPorRodada: SegundosPorRodada;
    rodadas: number;
    maximoDeJogadores: number;
};

export type Sala = ConfiguracaoDaSala & {
    id: number;
    donoId: number;
    privada: boolean;
    jogadores: number;
    situacao: SituacaoDaSala;
};

// Na edição, a senha que não vai (undefined) fica como está; null deixa a sala pública.
export type DadosSala = ConfiguracaoDaSala & {
    senha?: string | null;
};

export type FiltroDasSalas = "abertas" | "minhas";

export type Participante = {
    id: number;
    salaId: number;
    usuarioId: number;
    apelido: string;
    pontos: number;
    dono: boolean;
};

export type DadosParticipante = {
    apelido: string;
    senha?: string | null;
};
