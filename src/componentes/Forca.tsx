import type { ReactElement } from "react";
import "./Forca.css";

type Parte = {
    nome: string;
    desenho: ReactElement;
};

const PARTES: Parte[] = [
    { nome: "cabeça", desenho: <circle cx="150" cy="70" r="18" /> },
    { nome: "tronco", desenho: <line x1="150" y1="88" x2="150" y2="145" /> },
    { nome: "braço esquerdo", desenho: <line x1="150" y1="102" x2="124" y2="128" /> },
    { nome: "braço direito", desenho: <line x1="150" y1="102" x2="176" y2="128" /> },
    { nome: "perna esquerda", desenho: <line x1="150" y1="145" x2="128" y2="182" /> },
    { nome: "perna direita", desenho: <line x1="150" y1="145" x2="172" y2="182" /> },
];

function emLista(nomes: string[]): string {
    return nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}` : nomes.join("");
}

function descrever(desenhadas: Parte[]): string {
    if (desenhadas.length === 0) {
        return "Forca vazia";
    }
    if (desenhadas.length === PARTES.length) {
        return "Forca com o boneco completo";
    }
    return `Forca com ${emLista(desenhadas.map((parte) => parte.nome))}`;
}

type Props = {
    erros: number;
};

export function Forca({ erros }: Props) {
    const desenhadas = PARTES.slice(0, Math.max(0, erros));
    const completa = desenhadas.length === PARTES.length;

    return (
        <svg className={completa ? "forca forca--completa" : "forca"} viewBox="0 0 200 220" role="img" aria-label={descrever(desenhadas)}>
            <g className="forca__estrutura">
                <line x1="20" y1="205" x2="120" y2="205" />
                <line x1="50" y1="205" x2="50" y2="20" />
                <line x1="50" y1="20" x2="150" y2="20" />
                <line x1="150" y1="20" x2="150" y2="52" />
            </g>
            {desenhadas.map((parte) => (
                <g key={parte.nome} className="forca__parte">
                    {parte.desenho}
                </g>
            ))}
        </svg>
    );
}
