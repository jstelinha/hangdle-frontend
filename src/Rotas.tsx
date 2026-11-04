import { Route, Routes } from "react-router-dom";
import { RotaProtegida } from "./componentes/RotaProtegida";
import { CadastroPage } from "./pages/CadastroPage";
import { EstatisticasPage } from "./pages/EstatisticasPage";
import { InicioPage } from "./pages/InicioPage";
import { JogoPage } from "./pages/JogoPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Rubrica de Exigência - react-router-dom
export function Rotas() {
    return (
        <Routes>
            <Route path="/" element={<InicioPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/jogo" element={<JogoPage />} />
            <Route
                path="/estatisticas"
                element={
                    <RotaProtegida>
                        <EstatisticasPage />
                    </RotaProtegida>
                }
            />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
