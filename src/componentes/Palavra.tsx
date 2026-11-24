import type { CSSProperties } from "react";
import type { Casa } from "../jogo/Rodada";
import "./Palavra.css";

type Props = {
    casas: Casa[];
    mostrarResposta: boolean;
};

function agruparPorPalavra(casas: Casa[]): Casa[][] {
    const grupos: Casa[][] = [[]];
    for (const casa of casas) {
        if (casa.caractere === " ") {
            grupos.push([]);
        } else {
            grupos[grupos.length - 1]?.push(casa);
        }
    }
    return grupos.filter((grupo) => grupo.length > 0);
}

function classeDaCasa(casa: Casa, mostrarResposta: boolean): string {
    if (casa.tipo === "separador") {
        return "casa casa--separador";
    }
    if (casa.revelada) {
        return "casa casa--certa";
    }
    return mostrarResposta ? "casa casa--faltou" : "casa";
}

function descrever(casas: Casa[], mostrarResposta: boolean): string {
    const letras = casas
        .filter((casa) => casa.caractere !== " ")
        .map((casa) => (casa.revelada || mostrarResposta ? casa.caractere : "vazio"));
    return `Palavra: ${letras.join(", ")}`;
}

// O tamanho das casas sai do grupo mais comprido: é ele que precisa caber numa linha (Palavra.css).
function letrasDoMaiorGrupo(grupos: Casa[][]): number {
    return Math.max(1, ...grupos.map((grupo) => grupo.length));
}

export function Palavra({ casas, mostrarResposta }: Props) {
    const grupos = agruparPorPalavra(casas);
    return (
        <div
            className="palavra"
            role="img"
            aria-label={descrever(casas, mostrarResposta)}
            style={{ "--letras": letrasDoMaiorGrupo(grupos) } as CSSProperties}
        >
            {grupos.map((grupo, indiceGrupo) => (
                <div key={indiceGrupo} className="palavra__grupo" aria-hidden="true">
                    {grupo.map((casa, indice) => (
                        <span key={indice} className={classeDaCasa(casa, mostrarResposta)}>
                            {casa.revelada || mostrarResposta ? casa.caractere : ""}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}
