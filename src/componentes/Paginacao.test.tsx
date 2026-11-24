import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Paginacao } from "./Paginacao";

function Endereco() {
    const { pathname, search } = useLocation();
    return <output>{pathname + search}</output>;
}

function abrirNa(endereco: string, pagina: number, totalDePaginas: number) {
    render(
        <MemoryRouter initialEntries={[endereco]}>
            <Routes>
                <Route
                    path="/listas"
                    element={
                        <>
                            <Paginacao pagina={pagina} totalDePaginas={totalDePaginas} />
                            <Endereco />
                        </>
                    }
                />
            </Routes>
        </MemoryRouter>,
    );
}

describe("paginação", () => {
    it("some quando tudo cabe em uma página", () => {
        abrirNa("/listas", 1, 1);

        expect(screen.queryByRole("navigation", { name: "Páginas" })).toBeNull();
    });

    it("leva para a próxima página pelo endereço", async () => {
        const usuario = userEvent.setup();
        abrirNa("/listas", 1, 3);

        expect(screen.getByText("Página 1 de 3")).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Anterior" })).toBeNull();
        await usuario.click(screen.getByRole("link", { name: "Próxima" }));

        expect(screen.getByRole("status").textContent).toBe("/listas?pagina=2");
    });

    it("a primeira página fica sem ?pagina", async () => {
        const usuario = userEvent.setup();
        abrirNa("/listas?pagina=2", 2, 3);

        await usuario.click(screen.getByRole("link", { name: "Anterior" }));

        expect(screen.getByRole("status").textContent).toBe("/listas");
    });

    it("mantém os filtros do endereço ao trocar de página", async () => {
        const usuario = userEvent.setup();
        abrirNa("/listas?filtro=minhas&pagina=2", 2, 3);

        await usuario.click(screen.getByRole("link", { name: "Próxima" }));
        expect(screen.getByRole("status").textContent).toBe("/listas?filtro=minhas&pagina=3");
    });

    it("de uma página que não existe mais, vai para a última", () => {
        abrirNa("/listas?pagina=4", 4, 3);

        expect(screen.getByRole("status").textContent).toBe("/listas?pagina=3");
    });
});
