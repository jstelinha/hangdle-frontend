import { Navigate, Outlet } from "react-router-dom";
import { useSessao } from "../sessao/contexto";

// As rotas dentro desta só abrem com login; sem login, vão para a tela de entrar.
export function RotaProtegida() {
    if (!useSessao()) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}
