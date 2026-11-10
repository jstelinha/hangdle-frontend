import "./Cronometro.css";

const ACABANDO = 10;

type Props = {
    segundos: number;
    rotulo: string;
};

function formatarSegundos(segundos: number): string {
    const inteiros = Math.max(0, Math.ceil(segundos));
    return `${Math.floor(inteiros / 60)}:${String(inteiros % 60).padStart(2, "0")}`;
}

// Quem manda os segundos é o back; o cronômetro só mostra, e fica vermelho nos últimos 10.
export function Cronometro({ segundos, rotulo }: Props) {
    return (
        <p className={segundos <= ACABANDO ? "cronometro cronometro--acabando" : "cronometro"} role="timer" aria-label={`${rotulo}: ${segundos} segundos`}>
            <span className="cronometro__rotulo">{rotulo}</span>
            <strong className="cronometro__tempo">{formatarSegundos(segundos)}</strong>
        </p>
    );
}
