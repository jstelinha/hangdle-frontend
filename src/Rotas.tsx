import { Route, Routes } from "react-router-dom";
import { RotaProtegida } from "./componentes/RotaProtegida";
import { CadastroPage } from "./pages/CadastroPage";
import { EstatisticasPage } from "./pages/EstatisticasPage";
import { FormularioListaPage } from "./pages/FormularioListaPage";
import { FormularioPalavraPage } from "./pages/FormularioPalavraPage";
import { InicioPage } from "./pages/InicioPage";
import { JogoPage } from "./pages/JogoPage";
import { ListasPage } from "./pages/ListasPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PalavrasPage } from "./pages/PalavrasPage";
import { PerfilPage } from "./pages/PerfilPage";

// Rubrica de Exigência - react-router-dom
export function Rotas() {
    return (
        <Routes>
            <Route path="/" element={<InicioPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/jogo" element={<JogoPage />} />
            <Route element={<RotaProtegida />}>
                <Route path="/estatisticas" element={<EstatisticasPage />} />
                <Route path="/perfil" element={<PerfilPage />} />
                <Route path="/listas" element={<ListasPage />} />
                <Route path="/listas/nova" element={<FormularioListaPage />} />
                <Route path="/listas/:id/editar" element={<FormularioListaPage />} />
                <Route path="/listas/:listaId/palavras" element={<PalavrasPage />} />
                <Route path="/listas/:listaId/palavras/nova" element={<FormularioPalavraPage />} />
                <Route path="/listas/:listaId/palavras/:id/editar" element={<FormularioPalavraPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
