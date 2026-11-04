import { useEffect, useState, type ReactNode } from "react";
import { ContextoDaSessao } from "./contexto";
import { EVENTO_SESSAO, lerSessao } from "./sessao";

type Props = {
    children: ReactNode;
};

export function ProvedorDeSessao({ children }: Props) {
    const [sessao, setSessao] = useState(() => lerSessao());

    useEffect(() => {
        const atualizar = () => setSessao(lerSessao());
        window.addEventListener(EVENTO_SESSAO, atualizar);
        window.addEventListener("storage", atualizar);
        return () => {
            window.removeEventListener(EVENTO_SESSAO, atualizar);
            window.removeEventListener("storage", atualizar);
        };
    }, []);

    return <ContextoDaSessao value={sessao}>{children}</ContextoDaSessao>;
}
