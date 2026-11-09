import type { DadosParticipante, DadosSala, Participante, Sala } from "../types/sala";
import { recursosDaApi } from "./recursos";

export const salas = recursosDaApi<Sala, DadosSala>("/salas");

export function participantesDaSala(salaId: number) {
    return recursosDaApi<Participante, DadosParticipante>(`/salas/${salaId}/participantes`);
}
