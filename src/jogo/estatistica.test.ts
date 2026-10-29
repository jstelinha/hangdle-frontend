import { describe, expect, it } from "vitest";
import { media, regressaoLinear } from "./estatistica";

describe("estatística", () => {
    it("média", () => {
        expect(media([2, 4, 9])).toBe(5);
        expect(media([])).toBe(0);
    });

    it("regressão de pontos sobre uma reta exata", () => {
        const regressao = regressaoLinear([
            { x: 0, y: 10 },
            { x: 1, y: 12 },
            { x: 2, y: 14 },
        ]);

        expect(regressao?.inclinacao).toBeCloseTo(2, 10);
        expect(regressao?.intercepto).toBeCloseTo(10, 10);
        expect(regressao?.r2).toBeCloseTo(1, 10);
    });

    it("regressão de pontos espalhados, conferida à mão", () => {
        const regressao = regressaoLinear([
            { x: 1, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 5 },
            { x: 4, y: 4 },
        ]);

        expect(regressao?.inclinacao).toBeCloseTo(0.8, 10);
        expect(regressao?.intercepto).toBeCloseTo(1.5, 10);
        expect(regressao?.r2).toBeCloseTo(0.64, 10);
    });

    it("sem variação em X não existe reta", () => {
        expect(regressaoLinear([{ x: 3, y: 1 }, { x: 3, y: 9 }])).toBeNull();
        expect(regressaoLinear([{ x: 1, y: 1 }])).toBeNull();
    });
});
