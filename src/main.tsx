import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { Rotas } from "./Rotas";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Rotas />
        </BrowserRouter>
    </StrictMode>,
);
