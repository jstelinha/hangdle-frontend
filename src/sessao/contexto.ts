import { createContext, useContext } from "react";
import type { Sessao } from "../types/usuario";

export const ContextoDaSessao = createContext<Sessao | null | undefined>(undefined);

// Rubrica de Front-end - Edição de Usuário - Utilizar contexto para exibir informações do usuário globalmente
export function useSessao(): Sessao | null {
    const sessao = useContext(ContextoDaSessao);
    if (sessao === undefined) {
        throw new Error("useSessao precisa estar dentro do ProvedorDeSessao.");
    }
    return sessao;
}
