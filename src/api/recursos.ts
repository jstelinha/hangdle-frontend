import type { Pagina } from "../types/pagina";
import { api } from "./axios";

export type Recursos<Recurso, Dados> = {
    listar: (pagina: number) => Promise<Pagina<Recurso>>;
    buscar: (id: number) => Promise<Recurso>;
    criar: (dados: Dados) => Promise<Recurso>;
    editar: (id: number, dados: Dados) => Promise<Recurso>;
    apagar: (id: number) => Promise<void>;
};

// Rubrica de Tech Forge - Tipagem Avançada e Recursos do TypeScript - Generics para reaproveitar código tipado
// As cinco rotas de um CRUD do back, iguais para listas, palavras, salas e participantes.
export function recursosDaApi<Recurso, Dados>(caminho: string): Recursos<Recurso, Dados> {
    return {
        listar: async (pagina) => (await api.get<Pagina<Recurso>>(caminho, { params: { pagina } })).data,
        buscar: async (id) => (await api.get<Recurso>(`${caminho}/${id}`)).data,
        criar: async (dados) => (await api.post<Recurso>(caminho, dados)).data,
        editar: async (id, dados) => (await api.put<Recurso>(`${caminho}/${id}`, dados)).data,
        apagar: async (id) => {
            await api.delete(`${caminho}/${id}`);
        },
    };
}
