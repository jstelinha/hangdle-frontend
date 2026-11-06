import { describe, expect, it } from "vitest";
import { CHAVE_CHUTES_DO_DIA, guardarChutesDoDia, lerChutesDoDia } from "./chutesDoDia";

describe("chutes do dia", () => {
    it("guarda e devolve os chutes do mesmo dia", () => {
        guardarChutesDoDia("2026-11-03", ["Z", "M"]);

        expect(lerChutesDoDia("2026-11-03")).toEqual(["Z", "M"]);
    });

    it("chutes de outro dia não valem", () => {
        guardarChutesDoDia("2026-11-02", ["Z", "M"]);

        expect(lerChutesDoDia("2026-11-03")).toBeNull();
    });

    it("ignora o que estiver estragado no localStorage", () => {
        localStorage.setItem(CHAVE_CHUTES_DO_DIA, "{quebrado");
        expect(lerChutesDoDia("2026-11-03")).toBeNull();

        localStorage.setItem(CHAVE_CHUTES_DO_DIA, JSON.stringify({ dia: "2026-11-03", chutes: [1, 2] }));
        expect(lerChutesDoDia("2026-11-03")).toBeNull();
    });
});
