import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProximaPalavra } from "./ProximaPalavra";

describe("próxima palavra", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-03T23:59:58-03:00"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("conta os segundos até a meia-noite de Brasília", () => {
        render(<ProximaPalavra dia="2026-11-03" aoVirarODia={vi.fn()} />);

        expect(screen.getByRole("timer").textContent).toBe("Próxima palavra em 00:00:02");

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByRole("timer").textContent).toBe("Próxima palavra em 00:00:01");
    });

    it("avisa quando o dia vira", () => {
        const aoVirarODia = vi.fn();
        render(<ProximaPalavra dia="2026-11-03" aoVirarODia={aoVirarODia} />);

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(aoVirarODia).toHaveBeenCalled();
    });
});
