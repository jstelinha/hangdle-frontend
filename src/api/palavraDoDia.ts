import type { PalavraDoDia } from "../types/jogo";
import { api } from "./axios";

export async function buscarPalavraDoDia(): Promise<PalavraDoDia> {
    const resposta = await api.get<PalavraDoDia>("/palavra-do-dia");
    return resposta.data;
}
