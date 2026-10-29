import { Navigate, Route, Routes } from "react-router-dom";
import { RotaProtegida } from "./componentes/RotaProtegida";
import { CadastroPage } from "./pages/CadastroPage";
import { JogoPage } from "./pages/JogoPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { lerSessao } from "./sessao/sessao";

function Inicio() {
    return <Navigate to={lerSessao() ? "/jogo" : "/login"} replace />;
}

// Rubrica de Exigência - react-router-dom
export function Rotas() {
    return (
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/jogo"
                element={
                    <RotaProtegida>
                        <JogoPage />
                    </RotaProtegida>
                }
            />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
