import type { Nivel } from "../jogo/niveis";
import "./PainelRodada.css";

type Props = {
    numero: number;
    total: number;
    nivel: Nivel;
    categoria: string;
    vidasRestantes: number;
    segundosRestantes: number;
};

const SEGUNDOS_DE_ALERTA = 10;

function formatarTempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    return `${minutos}:${String(segundos % 60).padStart(2, "0")}`;
}

export function PainelRodada({ numero, total, nivel, categoria, vidasRestantes, segundosRestantes }: Props) {
    const alerta = segundosRestantes <= SEGUNDOS_DE_ALERTA;

    return (
        <section className="painel" aria-label="Situação da rodada">
            <p className="painel__rodada">
                Rodada {numero} de {total} · {nivel.nome} · {categoria}
            </p>
            <div className="painel__medidas">
                <div className="painel__medida">
                    <span className="painel__rotulo">Vidas</span>
                    <span className="painel__vidas" role="img" aria-label={`${vidasRestantes} de ${nivel.vidas} vidas`}>
                        {Array.from({ length: nivel.vidas }, (_, indice) => (
                            <span key={indice} className={indice < vidasRestantes ? "vida vida--cheia" : "vida"} />
                        ))}
                    </span>
                    <span className="painel__valor" aria-hidden="true">
                        {vidasRestantes}/{nivel.vidas}
                    </span>
                </div>
                <div className="painel__medida painel__medida--tempo">
                    <span className="painel__rotulo">Tempo</span>
                    <span className={alerta ? "painel__valor painel__valor--alerta" : "painel__valor"} aria-label={`${segundosRestantes} segundos restantes`}>
                        {formatarTempo(segundosRestantes)}
                    </span>
                </div>
            </div>
            <div className="painel__barra" aria-hidden="true">
                <span className={alerta ? "painel__barra-cheia painel__barra-cheia--alerta" : "painel__barra-cheia"} style={{ width: `${(segundosRestantes / nivel.segundos) * 100}%` }} />
            </div>
        </section>
    );
}
