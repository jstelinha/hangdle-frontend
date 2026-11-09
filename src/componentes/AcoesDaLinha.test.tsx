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

    it("aceita outros nomes para as ações, como sair da sala", async () => {
        const aoApagar = vi.fn(() => Promise.resolve());
        const usuario = userEvent.setup();
        render(
            <MemoryRouter>
                <AcoesDaLinha nome="Lari" editarEm="/salas/5/participantes/2/editar" rotuloDeEditar="Trocar apelido" aoApagar={aoApagar} rotuloDeApagar="Sair" />
            </MemoryRouter>,
        );

        expect(screen.getByRole("link", { name: "Trocar apelido Lari" })).toBeTruthy();
        await usuario.click(screen.getByRole("button", { name: "Sair Lari" }));
        await usuario.click(screen.getByRole("button", { name: "Sim, sair" }));

        expect(aoApagar).toHaveBeenCalledOnce();
    });

    it("sem aoApagar, mostra só o editar", () => {
        render(
            <MemoryRouter>
                <AcoesDaLinha nome="Animais" editarEm="/listas/3/editar" />
            </MemoryRouter>,
        );

        expect(screen.getByRole("link", { name: "Editar Animais" })).toBeTruthy();
        expect(screen.queryByRole("button")).toBeNull();
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
