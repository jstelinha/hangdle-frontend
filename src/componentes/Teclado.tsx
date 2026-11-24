import { LINHAS_DO_TECLADO } from "../jogo/letras";
import "./Teclado.css";

type Props = {
    certas: string[];
    erradas: string[];
    // Letras já digitadas que ainda esperam a resposta do back.
    pendentes?: string[];
    aoTeclar: (letra: string) => void;
};

type EstadoTecla = "livre" | "enviando" | "certa" | "errada";

const DESCRICAO: Record<EstadoTecla, string> = {
    livre: "",
    enviando: ", enviando",
    certa: ", está na palavra",
    errada: ", não está na palavra",
};

export function Teclado({ certas, erradas, pendentes = [], aoTeclar }: Props) {
    function estadoDa(letra: string): EstadoTecla {
        if (certas.includes(letra)) {
            return "certa";
        }
        if (erradas.includes(letra)) {
            return "errada";
        }
        return pendentes.includes(letra) ? "enviando" : "livre";
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
                                // A tecla enviando continua focável: só fica marcada como indisponível.
                                disabled={estado === "certa" || estado === "errada"}
                                aria-disabled={estado === "enviando" || undefined}
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
