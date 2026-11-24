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

    it("nos últimos 10 segundos, avisa em texto e uma vez para o leitor de tela", () => {
        const { container, rerender } = render(<Cronometro segundos={12} rotulo="Tempo para adivinhar" />);
        const regiaoViva = container.querySelector("[aria-live]");

        expect(regiaoViva?.textContent).toBe("");
        expect(screen.queryByText(/acabando/)).toBeNull();

        rerender(<Cronometro segundos={10} rotulo="Tempo para adivinhar" />);
        expect(screen.getByText("· acabando")).toBeTruthy();
        expect(regiaoViva?.textContent).toBe("Faltam 10 segundos.");

        rerender(<Cronometro segundos={4} rotulo="Tempo para adivinhar" />);
        expect(regiaoViva?.textContent).toBe("Faltam 10 segundos.");
    });

    it("no intervalo, não avisa que o tempo está acabando", () => {
        const { container } = render(<Cronometro segundos={4} rotulo="Bru escolhe a próxima palavra em" avisarNoFim={false} />);

        expect(container.querySelector(".cronometro--acabando")).toBeNull();
        expect(container.querySelector("[aria-live]")?.textContent).toBe("");
    });

    it("nunca mostra tempo negativo", () => {
        render(<Cronometro segundos={-3} rotulo="Tempo" />);

        expect(screen.getByRole("timer").textContent).toContain("0:00");
    });
});
