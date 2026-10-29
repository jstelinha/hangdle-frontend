import "./Logotipo.css";

const LETRAS = [..."HANGDLE"];

type Props = {
    tamanho?: "pequeno" | "grande";
};

export function Logotipo({ tamanho = "pequeno" }: Props) {
    return (
        <span className={`logotipo logotipo--${tamanho}`} aria-label="Hangdle" role="img">
            {LETRAS.map((letra, indice) => (
                <span key={indice} className={indice < 4 ? "logotipo__casa logotipo__casa--certa" : "logotipo__casa"} aria-hidden="true">
                    {letra}
                </span>
            ))}
        </span>
    );
}
