import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Pagina } from "../types/pagina";
import { useCarregamento } from "./useCarregamento";

const PAGINA_MAXIMA = 10_000;

function lerPagina(texto: string | null): number {
    const pagina = Number(texto);
    return Number.isInteger(pagina) && pagina >= 1 && pagina <= PAGINA_MAXIMA ? pagina : 1;
}

// Rubrica de Front-end - Cruds Completos - Paginação das listagens
// A página fica no endereço (?pagina=2), então recarregar e voltar continuam nela.
export function useListagem<T>(listar: (pagina: number) => Promise<Pagina<T>>) {
    const [parametros] = useSearchParams();
    const pagina = lerPagina(parametros.get("pagina"));
    const carregar = useCallback(() => listar(pagina), [listar, pagina]);
    return useCarregamento(carregar);
}
