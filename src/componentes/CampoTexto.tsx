import type { HTMLInputTypeAttribute, ReactNode } from "react";
import "./CampoTexto.css";

type Props = {
    id: string;
    rotulo: string;
    valor: string;
    aoMudar: (valor: string) => void;
    erro?: string;
    tipo?: HTMLInputTypeAttribute;
    autoComplete?: string;
    inputMode?: "text" | "email" | "numeric";
    placeholder?: string;
    maxLength?: number;
    children?: ReactNode;
};

export function CampoTexto({ id, rotulo, valor, aoMudar, erro, tipo = "text", autoComplete, inputMode, placeholder, maxLength, children }: Props) {
    const idErro = `${id}-erro`;
    const idAjuda = `${id}-ajuda`;
    const descritoPor = [erro ? idErro : null, children ? idAjuda : null].filter((parte) => parte !== null).join(" ");

    return (
        <div className={erro ? "campo campo--erro" : "campo"}>
            <label htmlFor={id} className="campo__rotulo">
                {rotulo}
            </label>
            <input
                id={id}
                name={id}
                className="campo__entrada"
                type={tipo}
                value={valor}
                onChange={(evento) => aoMudar(evento.target.value)}
                autoComplete={autoComplete}
                inputMode={inputMode}
                placeholder={placeholder}
                maxLength={maxLength}
                aria-invalid={erro ? true : undefined}
                aria-describedby={descritoPor || undefined}
            />
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
