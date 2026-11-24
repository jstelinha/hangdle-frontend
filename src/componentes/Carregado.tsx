import type { ReactNode } from "react";
import type { Carregamento } from "../hooks/useCarregamento";
import { Aviso } from "./Aviso";
import "./Carregado.css";

type Props<T> = {
    carregamento: Carregamento<T>;
    carregando: string;
    children: (dados: T) => ReactNode;
};

// Mostra o recado enquanto busca, o erro se a busca falhou e o conteúdo quando os dados chegam.
export function Carregado<T>({ carregamento, carregando, children }: Props<T>) {
    if (carregamento.situacao === "carregando") {
        return (
            <p role="status" className="carregado__recado">
                {carregando}
            </p>
        );
    }
    if (carregamento.situacao === "falhou") {
        return <Aviso mensagem={carregamento.mensagem} />;
    }
    return children(carregamento.dados);
}
