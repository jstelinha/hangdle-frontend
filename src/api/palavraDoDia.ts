import type { EstatisticasDoDia, JogoDoDia } from "../types/jogo";
import { api } from "./axios";

// A partida de hoje sem nenhuma letra: a palavra fica no back até o fim.
export async function comecarJogoDoDia(): Promise<JogoDoDia> {
    const resposta = await api.get<JogoDoDia>("/palavra-do-dia");
    return resposta.data;
}

export async function chutarNoDia(token: string, letra: string): Promise<JogoDoDia> {
    const resposta = await api.post<JogoDoDia>("/palavra-do-dia/letras", { token, letra });
    return resposta.data;
}

export async function buscarEstatisticasDoDia(dia: string): Promise<EstatisticasDoDia> {
    const resposta = await api.get<EstatisticasDoDia>("/palavra-do-dia/estatisticas", { params: { dia } });
    return resposta.data;
}
