import { useState } from "react";
import { useLocation } from "react-router-dom";

export type AvisoNaTela = { tipo: "erro" | "sucesso"; mensagem: string };

export function comAviso(mensagem: string) {
    return { state: { aviso: mensagem } };
}

function avisoDoEstado(estado: unknown): AvisoNaTela | null {
    if (typeof estado === "object" && estado !== null && "aviso" in estado && typeof estado.aviso === "string") {
        return { tipo: "sucesso", mensagem: estado.aviso };
    }
    return null;
}

// O recado que uma tela deixa para a próxima, como "Lista criada." depois de salvar: navegar(destino, comAviso("...")).
export function useAvisoDaNavegacao() {
    const { state } = useLocation();
    return useState<AvisoNaTela | null>(() => avisoDoEstado(state));
}
