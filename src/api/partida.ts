import type { EscolhaDaPalavra, EstadoDaPartida } from "../types/partida";
import { api } from "./axios";

function caminho(salaId: number): string {
    return `/salas/${salaId}/partida`;
}

export async function buscarPartida(salaId: number): Promise<EstadoDaPartida> {
    return (await api.get<EstadoDaPartida>(caminho(salaId))).data;
}

export async function comecarPartida(salaId: number): Promise<EstadoDaPartida> {
    return (await api.post<EstadoDaPartida>(caminho(salaId))).data;
}

export async function escolherPalavra(salaId: number, escolha: EscolhaDaPalavra): Promise<EstadoDaPartida> {
    return (await api.post<EstadoDaPartida>(`${caminho(salaId)}/palavra`, escolha)).data;
}

export async function chutarLetra(salaId: number, letra: string): Promise<EstadoDaPartida> {
    return (await api.post<EstadoDaPartida>(`${caminho(salaId)}/letras`, { letra })).data;
}
