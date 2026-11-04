import { describe, expect, it } from "vitest";
import { diaNoFuso, formatarContagem, segundosAteAProximaPalavra } from "./relogioDoDia";

describe("relógio do dia", () => {
    it("o dia segue o horário de Brasília", () => {
        expect(diaNoFuso(new Date("2026-11-04T02:00:00Z"))).toBe("2026-11-03");
        expect(diaNoFuso(new Date("2026-11-04T03:00:00Z"))).toBe("2026-11-04");
    });

    it("conta quanto falta para a meia-noite de Brasília", () => {
        expect(segundosAteAProximaPalavra(new Date("2026-11-03T00:00:00-03:00"))).toBe(86_400);
        expect(segundosAteAProximaPalavra(new Date("2026-11-03T23:59:30-03:00"))).toBe(30);
    });

    it("mostra a contagem como horas, minutos e segundos", () => {
        expect(formatarContagem(3725)).toBe("01:02:05");
        expect(formatarContagem(30)).toBe("00:00:30");
    });
});
