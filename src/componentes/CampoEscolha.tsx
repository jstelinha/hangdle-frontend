import type { ReactNode } from "react";
import "./CampoTexto.css";

export type Opcao = {
    valor: string;
    rotulo: string;
};

type Props = {
    id: string;
    rotulo: string;
    valor: string;
    opcoes: Opcao[];
    aoMudar: (valor: string) => void;
    erro?: string;
    children?: ReactNode;
};

// O mesmo visual e os mesmos avisos do CampoTexto, para escolher entre opções fixas.
export function CampoEscolha({ id, rotulo, valor, opcoes, aoMudar, erro, children }: Props) {
    const idErro = `${id}-erro`;
    const idAjuda = `${id}-ajuda`;
    const descritoPor = [erro ? idErro : null, children ? idAjuda : null].filter((parte) => parte !== null).join(" ");

    return (
        <div className={erro ? "campo campo--erro" : "campo"}>
            <label htmlFor={id} className="campo__rotulo">
                {rotulo}
            </label>
            <select
                id={id}
                name={id}
                className="campo__entrada"
                value={valor}
                onChange={(evento) => aoMudar(evento.target.value)}
                aria-invalid={erro ? true : undefined}
                aria-describedby={descritoPor || undefined}
            >
                {opcoes.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                        {opcao.rotulo}
                    </option>
                ))}
            </select>
            {erro && (
                <p id={idErro} className="campo__erro">
                    {erro}
                </p>
            )}
            {children && (
                <div id={idAjuda} className="campo__ajuda">
                    {children}
                </div>
            )}
        </div>
    );
}
