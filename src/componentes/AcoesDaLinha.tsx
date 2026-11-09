import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./AcoesDaLinha.css";

type Props = {
    nome: string;
    editarEm?: string;
    rotuloDeEditar?: string;
    aoApagar?: () => Promise<void>;
    rotuloDeApagar?: string;
};

// Editar e apagar uma linha da listagem. Apagar (ou sair, ou tirar) pede confirmação antes de chamar a API.
export function AcoesDaLinha({ nome, editarEm, rotuloDeEditar = "Editar", aoApagar, rotuloDeApagar = "Apagar" }: Props) {
    const [confirmando, setConfirmando] = useState(false);
    const [apagando, setApagando] = useState(false);
    const botaoApagar = useRef<HTMLButtonElement>(null);
    const botaoNao = useRef<HTMLButtonElement>(null);
    const jaPerguntou = useRef(false);

    // O foco vai para o "Não" quando a pergunta aparece e volta para o botão de apagar quando ela some.
    useEffect(() => {
        if (confirmando) {
            jaPerguntou.current = true;
            botaoNao.current?.focus();
        } else if (jaPerguntou.current) {
            botaoApagar.current?.focus();
        }
    }, [confirmando]);

    async function apagar() {
        if (!aoApagar) {
            return;
        }
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
            <div className="acoes" role="group" aria-label={`${rotuloDeApagar} ${nome}?`}>
                <span className="acoes__pergunta">{rotuloDeApagar}?</span>
                <button type="button" className="botao botao--discreto acoes__apagar" onClick={apagar} disabled={apagando}>
                    {apagando ? "Um momento..." : `Sim, ${rotuloDeApagar.toLocaleLowerCase("pt-BR")}`}
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
                <Link to={editarEm} className="botao botao--discreto" aria-label={`${rotuloDeEditar} ${nome}`}>
                    {rotuloDeEditar}
                </Link>
            )}
            {aoApagar && (
                <button
                    ref={botaoApagar}
                    type="button"
                    className="botao botao--discreto"
                    onClick={() => setConfirmando(true)}
                    aria-label={`${rotuloDeApagar} ${nome}`}
                >
                    {rotuloDeApagar}
                </button>
            )}
        </div>
    );
}
