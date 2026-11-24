import type { Ref } from "react";
import "./Aviso.css";

type Props = {
    mensagem: string | null;
    tipo?: "erro" | "sucesso" | "informacao";
    // Para a página levar o foco ao aviso (tabIndex -1), como depois de apagar uma linha (useFocoNoAviso).
    ref?: Ref<HTMLDivElement>;
};

// Sem mensagem, o aviso continua na tela, vazio e sem ocupar espaço, como região viva (role="status"): o leitor de
// tela só anuncia com segurança o texto que chega numa região que já existia. Quando a mensagem chega, o React usa o
// mesmo elemento. O erro usa role="alert", que os leitores anunciam mesmo quando o elemento acaba de entrar.
export function Aviso({ mensagem, tipo = "erro", ref }: Props) {
    if (!mensagem) {
        return <div ref={ref} className="aviso-vazio" role="status" />;
    }
    return (
        <div ref={ref} className={`aviso aviso--${tipo}`} role={tipo === "erro" ? "alert" : "status"} tabIndex={-1}>
            {mensagem}
        </div>
    );
}
