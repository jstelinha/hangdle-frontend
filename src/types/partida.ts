import type { SituacaoDaSala } from "./sala";

// O mesmo formato que o back devolve em GET /salas/:salaId/partida (src/dominio/EstadoDaPartida.ts).
export type FaseDaVez = "intervalo" | "escolhendo" | "adivinhando";

export type Jogador = {
    participanteId: number;
    apelido: string;
};

export type OpcaoDePalavra = {
    id: number;
    palavra: string;
    dica: string | null;
};

// As casas vêm com a letra, se já saiu, ou null, se ainda está escondida. Espaço e hífen vêm sempre.
export type MinhaForca = {
    casas: (string | null)[];
    letras: string[];
    erros: number;
    acertou: boolean;
    terminou: boolean;
};

export type ForcaDeOutro = Jogador & {
    erros: number;
    casasAbertas: number;
    acertou: boolean;
    terminou: boolean;
};

export type VezEmAndamento = {
    numero: number;
    rodada: number;
    fase: FaseDaVez;
    segundosRestantes: number;
    escolhedor: Jogador;
    opcoes: OpcaoDePalavra[] | null;
    palavra: string | null;
    dica: string | null;
    minhaForca: MinhaForca | null;
    forcas: ForcaDeOutro[];
};

export type ResultadoDeJogador = Jogador & {
    acertou: boolean;
    erros: number;
    pontos: number;
};

export type ResultadoDaVez = Pick<VezEmAndamento, "numero" | "rodada" | "escolhedor" | "dica"> & {
    palavra: string;
    pontosDeQuemEscolheu: number;
    jogadores: ResultadoDeJogador[];
};

export type EstadoDaPartida = {
    situacao: SituacaoDaSala;
    rodadas: number;
    eu: number;
    placar: (Jogador & { pontos: number })[];
    vez: VezEmAndamento | null;
    anterior: ResultadoDaVez | null;
};

// Rubrica de Tech Forge - Tipagem Avançada e Recursos do TypeScript - União de tipos: a palavra vem da lista (pelo id) ou é digitada
export type EscolhaDaPalavra = { palavraId: number } | { palavra: string; dica: string | null };
