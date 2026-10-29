import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { lerSessao } from "../sessao/sessao";

type Props = {
    children: ReactNode;
};

export function RotaProtegida({ children }: Props) {
    if (!lerSessao()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
