import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Formulario.css";

type Props = {
    aoEnviar: () => unknown;
    enviando: boolean;
    voltarPara: string;
    rotuloDoEnvio?: string;
    // O texto do botão enquanto envia: "Salvando..." serve para os CRUDs, mas não para entrar numa sala.
    rotuloEnviando?: string;
    children: ReactNode;
};

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
// O formulário de cadastro e edição dos CRUDs, com Salvar e Cancelar.
export function Formulario({ aoEnviar, enviando, voltarPara, rotuloDoEnvio = "Salvar", rotuloEnviando = "Salvando...", children }: Props) {
    return (
        <form
            className="formulario"
            noValidate
            onSubmit={(evento) => {
                evento.preventDefault();
                aoEnviar();
            }}
        >
            {children}
            <div className="formulario__botoes">
                <button type="submit" className="botao" disabled={enviando} aria-busy={enviando}>
                    {enviando ? rotuloEnviando : rotuloDoEnvio}
                </button>
                <Link to={voltarPara} className="botao botao--discreto">
                    Cancelar
                </Link>
            </div>
        </form>
    );
}
