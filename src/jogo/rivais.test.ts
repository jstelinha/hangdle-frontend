import { describe, expect, it } from "vitest";
import { sorteioComSemente } from "./aleatorio";
import { NIVEIS } from "./niveis";
import { PALAVRAS_FIXAS } from "./palavras";
import { criarRivais, simularRodada } from "./rivais";

describe("rivais simulados", () => {
    it("a mesma semente gera os mesmos rivais e as mesmas rodadas", () => {
        const primeira = sorteioComSemente(42);
        const segunda = sorteioComSemente(42);

        const rival = criarRivais(primeira)[0]!;
        expect(criarRivais(segunda)[0]).toEqual(rival);
        expect(simularRodada(rival, PALAVRAS_FIXAS[1]!, NIVEIS.medio, primeira)).toEqual(
            simularRodada(rival, PALAVRAS_FIXAS[1]!, NIVEIS.medio, segunda),
        );
    });

    it("em 500 rodadas por nível, nunca passa das vidas nem do tempo", () => {
        const sorteio = sorteioComSemente(7);
        for (const palavra of PALAVRAS_FIXAS) {
            const nivel = NIVEIS[palavra.nivel];
            for (let vez = 0; vez < 100; vez++) {
                for (const rival of criarRivais(sorteio)) {
                    const resultado = simularRodada(rival, palavra, nivel, sorteio);
                    expect(resultado.erros).toBeLessThanOrEqual(nivel.vidas);
                    expect(resultado.segundosGastos).toBeLessThanOrEqual(nivel.segundos);
                    if (resultado.acertou) {
                        expect(resultado.erros).toBeLessThan(nivel.vidas);
                    }
                }
            }
        }
    });
});
