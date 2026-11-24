import type { DadosLista, DadosPalavra, Lista, PalavraDaLista } from "../types/lista";
import { recursosDaApi } from "./recursos";

export const listas = recursosDaApi<Lista, DadosLista>("/listas");

export function palavrasDaLista(listaId: number) {
    return recursosDaApi<PalavraDaLista, DadosPalavra>(`/listas/${listaId}/palavras`);
}
