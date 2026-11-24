import { totalDeLetras } from "../jogo/forcaDaSala";
import type { EstadoDaPartida } from "../types/partida";

// O que a região viva da partida diz quando a fase muda. A chave muda junto com a fase (e com a vez), e o texto só
// é anunciado quando a chave muda: a consulta de cada segundo não repete o recado.
export type AnuncioDaPartida = {
    chave: string;
    texto: string;
};

function plural(quantidade: number, singular: string, varios: string): string {
    return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

export function quemGanhou(estado: EstadoDaPartida): string {
    const maior = Math.max(...estado.placar.map((jogador) => jogador.pontos));
    const vencedores = estado.placar.filter((jogador) => jogador.pontos === maior).map((jogador) => jogador.apelido);
    return vencedores.length === 1 ? `${vencedores[0]} ganhou a partida!` : `Empate entre ${vencedores.join(" e ")}!`;
}

export function anuncioDaPartida(estado: EstadoDaPartida): AnuncioDaPartida | null {
    if (estado.situacao === "esperando") {
        return { chave: "esperando", texto: "" };
    }
    if (estado.situacao === "encerrada") {
        return { chave: "encerrada", texto: estado.placar.length > 0 ? `Fim da partida. ${quemGanhou(estado)}` : "Fim da partida." };
    }
    const vez = estado.vez;
    if (!vez) {
        return null;
    }
    const chave = `${vez.numero}:${vez.fase}`;
    if (vez.fase === "escolhendo") {
        const quem = vez.escolhedor.participanteId === estado.eu ? "Sua vez de escolher a palavra." : `${vez.escolhedor.apelido} está escolhendo a palavra.`;
        return { chave, texto: `Rodada ${vez.rodada} de ${estado.rodadas}. ${quem}` };
    }
    if (vez.fase === "adivinhando") {
        const texto = vez.minhaForca
            ? `Hora de adivinhar: ${plural(totalDeLetras(vez.minhaForca.casas), "letra", "letras")}.`
            : "Os outros estão adivinhando a sua palavra.";
        return { chave, texto };
    }
    return { chave, texto: estado.anterior ? `A palavra era ${estado.anterior.palavra}.` : "A palavra acabou." };
}
