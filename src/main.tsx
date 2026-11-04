import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { Rotas } from "./Rotas";
import { ProvedorDeSessao } from "./sessao/ProvedorDeSessao";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ProvedorDeSessao>
            <BrowserRouter>
                <Rotas />
            </BrowserRouter>
        </ProvedorDeSessao>
    </StrictMode>,
);
