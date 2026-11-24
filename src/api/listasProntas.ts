import type { Lista, ListaPronta } from "../types/lista";
import { api } from "./axios";

export async function buscarListasProntas(): Promise<ListaPronta[]> {
    const resposta = await api.get<{ listas: ListaPronta[] }>("/listas-prontas");
    return resposta.data.listas;
}

// Copia a lista pronta, com as palavras e as dicas, para as listas de quem está logado. Devolve a lista nova.
export async function copiarListaPronta(id: number): Promise<Lista> {
    const resposta = await api.post<Lista>(`/listas-prontas/${id}/copias`);
    return resposta.data;
}
