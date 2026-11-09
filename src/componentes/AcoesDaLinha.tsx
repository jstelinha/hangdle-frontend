import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./AcoesDaLinha.css";

type Props = {
    nome: string;
    editarEm?: string;
    aoApagar: () => Promise<void>;
};

// Editar e apagar uma linha da listagem. Apagar pede confirmação antes de chamar a API.
export function AcoesDaLinha({ nome, editarEm, aoApagar }: Props) {
    const [confirmando, setConfirmando] = useState(false);
    const [apagando, setApagando] = useState(false);
    const botaoApagar = useRef<HTMLButtonElement>(null);
    const botaoNao = useRef<HTMLButtonElement>(null);
    const jaPerguntou = useRef(false);

    // O foco vai para o "Não" quando a pergunta aparece e volta para o "Apagar" quando ela some.
    useEffect(() => {
        if (confirmando) {
            jaPerguntou.current = true;
            botaoNao.current?.focus();
        } else if (jaPerguntou.current) {
            botaoApagar.current?.focus();
        }
    }, [confirmando]);

    async function apagar() {
        setApagando(true);
        try {
            await aoApagar();
        } finally {
            setApagando(false);
            setConfirmando(false);
        }
    }

    if (confirmando) {
        return (
            <div className="acoes" role="group" aria-label={`Apagar ${nome}?`}>
                <span className="acoes__pergunta">Apagar?</span>
                <button type="button" className="botao botao--discreto acoes__apagar" onClick={apagar} disabled={apagando}>
                    {apagando ? "Apagando..." : "Sim, apagar"}
                </button>
                <button ref={botaoNao} type="button" className="botao botao--discreto" onClick={() => setConfirmando(false)} disabled={apagando}>
                    Não
                </button>
            </div>
        );
    }

    return (
        <div className="acoes">
            {editarEm && (
                <Link to={editarEm} className="botao botao--discreto" aria-label={`Editar ${nome}`}>
                    Editar
                </Link>
            )}
            <button ref={botaoApagar} type="button" className="botao botao--discreto" onClick={() => setConfirmando(true)} aria-label={`Apagar ${nome}`}>
                Apagar
            </button>
        </div>
    );
}
