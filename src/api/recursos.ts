import type { Pagina } from "../types/pagina";
import { api } from "./axios";

export type Filtros = Record<string, string | number>;

export type Recursos<Recurso, Dados> = {
    listar: (pagina: number, filtros?: Filtros) => Promise<Pagina<Recurso>>;
    buscar: (id: number) => Promise<Recurso>;
    criar: (dados: Dados) => Promise<Recurso>;
    editar: (id: number, dados: Dados) => Promise<Recurso>;
    apagar: (id: number) => Promise<void>;
};

// Rubrica de Tech Forge - Tipagem Avançada e Recursos do TypeScript - Generics para reaproveitar código tipado
// Rubrica de Tech Forge - Aderência aos Princípios SOLID - Aberto para extensão: as salas e os participantes entraram como mais um recursosDaApi, sem mudar esta função
// As cinco rotas de um CRUD do back, iguais para listas, palavras, salas e participantes.
export function recursosDaApi<Recurso, Dados>(caminho: string): Recursos<Recurso, Dados> {
    return {
        listar: async (pagina, filtros = {}) => (await api.get<Pagina<Recurso>>(caminho, { params: { ...filtros, pagina } })).data,
        buscar: async (id) => (await api.get<Recurso>(`${caminho}/${id}`)).data,
        criar: async (dados) => (await api.post<Recurso>(caminho, dados)).data,
        editar: async (id, dados) => (await api.put<Recurso>(`${caminho}/${id}`, dados)).data,
        apagar: async (id) => {
            await api.delete(`${caminho}/${id}`);
        },
    };
}
