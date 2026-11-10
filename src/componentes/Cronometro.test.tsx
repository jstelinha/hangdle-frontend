import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cronometro } from "./Cronometro";

describe("cronômetro", () => {
    it("mostra minutos e segundos e fica vermelho nos últimos 10", () => {
        const { container, rerender } = render(<Cronometro segundos={75} rotulo="Tempo para adivinhar" />);

        expect(screen.getByRole("timer", { name: "Tempo para adivinhar: 75 segundos" }).textContent).toContain("1:15");
        expect(container.querySelector(".cronometro--acabando")).toBeNull();

        rerender(<Cronometro segundos={9} rotulo="Tempo para adivinhar" />);
        expect(container.querySelector(".cronometro--acabando")).toBeTruthy();
    });

    it("nunca mostra tempo negativo", () => {
        render(<Cronometro segundos={-3} rotulo="Tempo" />);

        expect(screen.getByRole("timer").textContent).toContain("0:00");
    });
});
