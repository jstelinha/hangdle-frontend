import type { ResultadoDiario } from "../types/jogo";
import { api } from "./axios";

export async function buscarHistorico(): Promise<ResultadoDiario[]> {
    const resposta = await api.get<{ resultados: ResultadoDiario[] }>("/resultados");
    return resposta.data.resultados;
}
