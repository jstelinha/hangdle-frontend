import type { Ref } from "react";
import "./Aviso.css";

type Props = {
    mensagem: string | null;
    tipo?: "erro" | "sucesso" | "informacao";
    // Para a página levar o foco ao aviso (tabIndex -1), como depois de apagar uma linha (useFocoNoAviso).
    ref?: Ref<HTMLDivElement>;
};

export function Aviso({ mensagem, tipo = "erro", ref }: Props) {
    if (!mensagem) {
        return null;
    }
    return (
        <div ref={ref} className={`aviso aviso--${tipo}`} role={tipo === "erro" ? "alert" : "status"} tabIndex={-1}>
            {mensagem}
        </div>
    );
}
