import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./AcoesDaLinha.css";

type Props = {
    nome: string;
    editarEm?: string;
    rotuloDeEditar?: string;
    aoApagar?: () => Promise<void>;
    rotuloDeApagar?: string;
    // O que a confirmação pergunta. Diga o que se perde, como "Apagar Animais e as 12 palavras dela?".
    pergunta?: string;
};

// Editar e apagar uma linha da listagem. Apagar (ou sair, ou tirar) pede confirmação antes de chamar a API.
export function AcoesDaLinha({ nome, editarEm, rotuloDeEditar = "Editar", aoApagar, rotuloDeApagar = "Apagar", pergunta }: Props) {
    const [confirmando, setConfirmando] = useState(false);
    const [apagando, setApagando] = useState(false);
    const botaoApagar = useRef<HTMLButtonElement>(null);
    const botaoNao = useRef<HTMLButtonElement>(null);
    const jaPerguntou = useRef(false);

    // O foco vai para o "Não" quando a pergunta aparece e volta para o botão de apagar quando a pessoa diz "Não". Depois
    // do "Sim", quem cuida do foco é a página (a linha pode sumir): ela o leva para o aviso (useFocoNoAviso).
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
        jaPerguntou.current = false;
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
            <div key="confirmando" className="acoes acoes--confirmando" role="group" aria-label={pergunta ?? `${rotuloDeApagar} ${nome}?`}>
                <span className="acoes__pergunta">{pergunta ?? `${rotuloDeApagar}?`}</span>
                <button type="button" className="botao botao--discreto acoes__apagar" onClick={apagar} disabled={apagando}>
                    {apagando ? "Um momento..." : `Sim, ${rotuloDeApagar.toLocaleLowerCase("pt-BR")}`}
                </button>
                <button ref={botaoNao} type="button" className="botao botao--discreto" onClick={() => setConfirmando(false)} disabled={apagando}>
                    Não
                </button>
            </div>
        );
    }

    // As duas visões têm chaves diferentes: sem elas, o React reaproveitaria o nó do "Sim" como o botão de apagar, e o
    // foco ficaria nele sem ninguém pedir.
    return (
        <div key="acoes" className="acoes">
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
