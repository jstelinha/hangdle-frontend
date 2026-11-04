import axios from "axios";
import type { ResultadoDiario } from "../types/jogo";
import { api } from "./axios";

export async function buscarHistorico(): Promise<ResultadoDiario[]> {
    const resposta = await api.get<{ resultados: ResultadoDiario[] }>("/resultados");
    return resposta.data.resultados;
}

export async function salvarResultado(dia: string, letras: string[]): Promise<void> {
    await api.post("/resultados", { dia, letras });
}

export function jaEstavaSalvo(erro: unknown): boolean {
    return axios.isAxiosError(erro) && erro.response?.status === 409;
}
