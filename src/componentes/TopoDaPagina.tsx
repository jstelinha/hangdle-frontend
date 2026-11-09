import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./TopoDaPagina.css";

type Props = {
    titulo: string;
    subtitulo?: string;
    voltar?: { para: string; rotulo: string };
    children?: ReactNode;
};

export function TopoDaPagina({ titulo, subtitulo, voltar, children }: Props) {
    return (
        <div className="topo">
            {voltar && (
                <Link to={voltar.para} className="topo__voltar">
                    <span aria-hidden="true">← </span>
                    {voltar.rotulo}
                </Link>
            )}
            <div className="topo__linha">
                <h1 className="titulo">{titulo}</h1>
                {children && <div className="topo__acoes">{children}</div>}
            </div>
            {subtitulo && <p className="subtitulo">{subtitulo}</p>}
        </div>
    );
}
