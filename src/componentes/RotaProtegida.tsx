import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessao } from "../sessao/contexto";

// As rotas dentro desta só abrem com login. Sem login, vão para a tela de entrar levando o endereço, e o login volta
// para ele (por exemplo, o link de convite de uma sala).
export function RotaProtegida() {
    const sessao = useSessao();
    const local = useLocation();
    if (!sessao) {
        return <Navigate to="/login" replace state={{ voltarPara: `${local.pathname}${local.search}` }} />;
    }
    return <Outlet />;
}
