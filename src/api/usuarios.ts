import type { PerfilUsuario, Usuario } from "../types/usuario";
import { api } from "./axios";

export type DadosEdicao = {
    nome: string;
    cpf: string;
    senha: string;
};

export async function buscarPerfil(id: number): Promise<PerfilUsuario> {
    const resposta = await api.get<PerfilUsuario>(`/usuarios/${id}`);
    return resposta.data;
}

export async function editarPerfil(id: number, dados: DadosEdicao): Promise<Usuario> {
    const resposta = await api.put<Usuario>(`/usuarios/${id}`, dados);
    return resposta.data;
}
