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

export function Palavra({ casas, mostrarResposta }: Props) {
    return (
        <div className="palavra" role="img" aria-label={descrever(casas, mostrarResposta)}>
            {agruparPorPalavra(casas).map((grupo, indiceGrupo) => (
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
