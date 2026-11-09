import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AcoesDaLinha } from "./AcoesDaLinha";

function abrir(aoApagar: () => Promise<void>) {
    render(
        <MemoryRouter>
            <AcoesDaLinha nome="Animais" editarEm="/listas/3/editar" aoApagar={aoApagar} />
        </MemoryRouter>,
    );
}

describe("ações da linha", () => {
    it("leva para a edição", () => {
        abrir(vi.fn());

        expect(screen.getByRole("link", { name: "Editar Animais" }).getAttribute("href")).toBe("/listas/3/editar");
    });

    it("só apaga depois de confirmar", async () => {
        const aoApagar = vi.fn(() => Promise.resolve());
        const usuario = userEvent.setup();
        abrir(aoApagar);

        await usuario.click(screen.getByRole("button", { name: "Apagar Animais" }));
        expect(aoApagar).not.toHaveBeenCalled();
        expect(screen.getByRole("group", { name: "Apagar Animais?" })).toBeTruthy();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Não" }));

        await usuario.click(screen.getByRole("button", { name: "Sim, apagar" }));
        expect(aoApagar).toHaveBeenCalledOnce();
    });

    it("desistir volta para os botões sem apagar", async () => {
        const aoApagar = vi.fn(() => Promise.resolve());
        const usuario = userEvent.setup();
        abrir(aoApagar);

        await usuario.click(screen.getByRole("button", { name: "Apagar Animais" }));
        await usuario.click(screen.getByRole("button", { name: "Não" }));

        expect(aoApagar).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Apagar Animais" }));
    });
});
