import "./Cronometro.css";

const ACABANDO = 10;

type Props = {
    segundos: number;
    rotulo: string;
    // O intervalo entre as palavras dura poucos segundos: lá não faz sentido avisar que o tempo está acabando.
    avisarNoFim?: boolean;
};

function formatarSegundos(segundos: number): string {
    const inteiros = Math.max(0, Math.ceil(segundos));
    return `${Math.floor(inteiros / 60)}:${String(inteiros % 60).padStart(2, "0")}`;
}

// Quem manda os segundos é o back; o cronômetro só mostra. Nos últimos 10 segundos, o aviso não fica só na cor: o
// texto "acabando" aparece, e a região viva (montada desde o começo, vazia) diz uma vez "Faltam 10 segundos.". O
// texto não muda mais até o fim, então não é repetido a cada segundo.
export function Cronometro({ segundos, rotulo, avisarNoFim = true }: Props) {
    const acabando = avisarNoFim && segundos <= ACABANDO;
    return (
        <>
            <p className={acabando ? "cronometro cronometro--acabando" : "cronometro"} role="timer" aria-label={`${rotulo}: ${segundos} segundos`}>
                <span className="cronometro__rotulo">
                    {rotulo}
                    {acabando && <span className="cronometro__alerta"> · acabando</span>}
                </span>
                <strong className="cronometro__tempo">{formatarSegundos(segundos)}</strong>
            </p>
            <p className="so-leitor" aria-live="assertive">
                {acabando ? `Faltam ${ACABANDO} segundos.` : ""}
            </p>
        </>
    );
}
