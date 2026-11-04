import { useEffect, useEffectEvent, useState } from "react";
import { diaNoFuso, formatarContagem, segundosAteAProximaPalavra } from "../jogo/relogioDoDia";
import "./ProximaPalavra.css";

type Props = {
    dia: string;
    aoVirarODia: () => void;
};

export function ProximaPalavra({ dia, aoVirarODia }: Props) {
    const [agora, setAgora] = useState(() => new Date());
    const virarODia = useEffectEvent(aoVirarODia);

    useEffect(() => {
        const relogio = window.setInterval(() => {
            const instante = new Date();
            if (diaNoFuso(instante) !== dia) {
                virarODia();
                return;
            }
            setAgora(instante);
        }, 1000);
        return () => window.clearInterval(relogio);
    }, [dia]);

    return (
        <p className="proxima-palavra" role="timer">
            Próxima palavra em <strong>{formatarContagem(segundosAteAProximaPalavra(agora))}</strong>
        </p>
    );
}
