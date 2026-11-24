import { describe, expect, it } from "vitest";
import type { EstadoDaPartida, VezEmAndamento } from "../types/partida";
import { anuncioDaPartida } from "./anuncioDaPartida";

const LARISSA = { participanteId: 1, apelido: "Larissa" };
const BRU = { participanteId: 2, apelido: "Bru" };

function vez(valores: Partial<VezEmAndamento> = {}): VezEmAndamento {
    return { numero: 3, rodada: 2, fase: "escolhendo", segundosRestantes: 18, escolhedor: BRU, opcoes: null, palavra: null, dica: null, minhaForca: null, forcas: [], ...valores };
}

function estado(valores: Partial<EstadoDaPartida> = {}): EstadoDaPartida {
    return {
        situacao: "jogando",
        rodadas: 3,
        eu: 1,
        placar: [
            { ...LARISSA, pontos: 130 },
            { ...BRU, pontos: 120 },
        ],
        vez: vez(),
        anterior: null,
        ...valores,
    };
}

describe("anúncio da partida", () => {
    it("diz a rodada e quem escolhe a palavra", () => {
        expect(anuncioDaPartida(estado())).toEqual({ chave: "3:escolhendo", texto: "Rodada 2 de 3. Bru está escolhendo a palavra." });
        expect(anuncioDaPartida(estado({ vez: vez({ escolhedor: LARISSA }) }))?.texto).toBe("Rodada 2 de 3. Sua vez de escolher a palavra.");
    });

    it("na hora de adivinhar, diz quantas letras tem a palavra, sem contar espaço e hífen", () => {
        const minhaForca = { casas: [null, null, null, null, " ", null, null], letras: [], erros: 0, acertou: false, terminou: false };

        expect(anuncioDaPartida(estado({ vez: vez({ fase: "adivinhando", minhaForca }) }))?.texto).toBe("Hora de adivinhar: 6 letras.");
        expect(anuncioDaPartida(estado({ vez: vez({ fase: "adivinhando", palavra: "ARARA" }) }))?.texto).toBe("Os outros estão adivinhando a sua palavra.");
    });

    it("no intervalo, diz qual era a palavra", () => {
        const anterior = { numero: 3, rodada: 2, escolhedor: BRU, palavra: "ARARA", dica: null, pontosDeQuemEscolheu: 10, jogadores: [] };

        expect(anuncioDaPartida(estado({ vez: vez({ fase: "intervalo" }), anterior }))).toEqual({ chave: "3:intervalo", texto: "A palavra era ARARA." });
    });

    it("no fim, diz quem ganhou", () => {
        expect(anuncioDaPartida(estado({ situacao: "encerrada", vez: null }))?.texto).toBe("Fim da partida. Larissa ganhou a partida!");
    });

    it("a chave só muda quando muda a fase ou a vez", () => {
        const antes = anuncioDaPartida(estado({ vez: vez({ segundosRestantes: 18 }) }));
        const depois = anuncioDaPartida(estado({ vez: vez({ segundosRestantes: 12 }) }));

        expect(antes?.chave).toBe(depois?.chave);
        expect(anuncioDaPartida(estado({ situacao: "esperando", vez: null }))).toEqual({ chave: "esperando", texto: "" });
    });
});
