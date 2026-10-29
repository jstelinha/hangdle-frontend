import { LINHAS_DO_TECLADO } from "../jogo/letras";
import "./Teclado.css";

type Props = {
    certas: string[];
    erradas: string[];
    desativado: boolean;
    aoTeclar: (letra: string) => void;
};

type EstadoTecla = "livre" | "certa" | "errada";

const DESCRICAO: Record<EstadoTecla, string> = {
    livre: "",
    certa: ", está na palavra",
    errada: ", não está na palavra",
};

export function Teclado({ certas, erradas, desativado, aoTeclar }: Props) {
    function estadoDa(letra: string): EstadoTecla {
        if (certas.includes(letra)) {
            return "certa";
        }
        return erradas.includes(letra) ? "errada" : "livre";
    }

    return (
        <div className="teclado" role="group" aria-label="Teclado">
            {LINHAS_DO_TECLADO.map((linha) => (
                <div key={linha} className="teclado__linha">
                    {[...linha].map((letra) => {
                        const estado = estadoDa(letra);
                        return (
                            <button
                                key={letra}
                                type="button"
                                className={`tecla tecla--${estado}`}
                                disabled={desativado || estado !== "livre"}
                                aria-label={`${letra}${DESCRICAO[estado]}`}
                                onClick={() => aoTeclar(letra)}
                            >
                                {letra}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
