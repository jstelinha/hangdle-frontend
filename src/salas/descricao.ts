import type { Sala, SituacaoDaSala } from "../types/sala";

export const SITUACAO_DA_SALA: Record<SituacaoDaSala, string> = {
    esperando: "Esperando jogadores",
    jogando: "Jogando",
    encerrada: "Encerrada",
};

export function rodadasDaSala({ rodadas, segundosPorRodada }: Pick<Sala, "rodadas" | "segundosPorRodada">): string {
    return `${rodadas === 1 ? "1 rodada" : `${rodadas} rodadas`} de ${segundosPorRodada} s`;
}

export function resumoDaSala(sala: Sala): string {
    return [rodadasDaSala(sala), sala.privada ? "com senha" : null, SITUACAO_DA_SALA[sala.situacao]].filter(Boolean).join(" · ");
}

export function linkDoConvite(salaId: number): string {
    return `${window.location.origin}/salas/${salaId}/entrar`;
}

// Igual ao back: quem entra começa com o primeiro nome da conta como apelido.
export function apelidoDoNome(nome: string): string {
    const completo = nome.trim().replace(/\s+/g, " ");
    const [primeiro = ""] = completo.split(" ");
    return (primeiro.length >= 2 ? primeiro : completo).slice(0, 20).trim();
}
