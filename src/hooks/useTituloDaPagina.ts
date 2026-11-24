import { useEffect } from "react";

const NOME_DO_SITE = "Hangdle";

export function tituloDaAba(titulo: string | null | undefined): string {
    return titulo ? `${titulo} · ${NOME_DO_SITE}` : NOME_DO_SITE;
}

// O título da aba diz em que tela a pessoa está (WCAG 2.4.2): é o que o leitor de tela lê ao trocar de aba, e o que
// aparece no histórico e nos favoritos. O TopoDaPagina já chama com o título da página; as telas sem ele chamam direto.
export function useTituloDaPagina(titulo: string | null | undefined): void {
    useEffect(() => {
        document.title = tituloDaAba(titulo);
    }, [titulo]);
}
