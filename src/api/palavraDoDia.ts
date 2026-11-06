import type { EstatisticasDoDia, PalavraDoDia } from "../types/jogo";
import { api } from "./axios";

export async function buscarPalavraDoDia(): Promise<PalavraDoDia> {
    const resposta = await api.get<PalavraDoDia>("/palavra-do-dia");
    return resposta.data;
}

export async function buscarEstatisticasDoDia(dia: string): Promise<EstatisticasDoDia> {
    const resposta = await api.get<EstatisticasDoDia>("/palavra-do-dia/estatisticas", { params: { dia } });
    return resposta.data;
}
