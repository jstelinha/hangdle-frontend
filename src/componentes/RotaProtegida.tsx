import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessao } from "../sessao/contexto";

type Props = {
    children: ReactNode;
};

export function RotaProtegida({ children }: Props) {
    if (!useSessao()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
