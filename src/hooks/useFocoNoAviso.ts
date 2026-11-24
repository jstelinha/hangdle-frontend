import { useEffect, useRef } from "react";

// Depois de apagar uma linha, ela some da tabela com o foco dentro, e o foco cairia no body. A página chama
// focarNoAviso() ao começar a apagar, e quando o aviso seguinte aparecer (de sucesso ou de erro) o foco vai para ele.
export function useFocoNoAviso(aviso: unknown) {
    const refDoAviso = useRef<HTMLDivElement>(null);
    const pedido = useRef(false);

    useEffect(() => {
        if (pedido.current && aviso) {
            pedido.current = false;
            refDoAviso.current?.focus();
        }
    }, [aviso]);

    return {
        refDoAviso,
        focarNoAviso: () => {
            pedido.current = true;
        },
    };
}
