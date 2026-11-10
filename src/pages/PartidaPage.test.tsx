import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";
import type { EstadoDaPartida, VezEmAndamento } from "../types/partida";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

// Quem entra nos testes (entrarComo) tem o id 7 e criou a sala; na partida, é o participante 1.
const SALA = { id: 5, donoId: 7, nome: "Forca da turma", listaId: null, segundosPorRodada: 90, rodadas: 2, maximoDeJogadores: 6, privada: false, jogadores: 2, situacao: "jogando" };
const LARISSA = { participanteId: 1, apelido: "Larissa" };
const BRU = { participanteId: 2, apelido: "Bru" };

function estado(valores: Partial<EstadoDaPartida> = {}): EstadoDaPartida {
    return {
        situacao: "jogando",
        rodadas: 2,
        eu: 1,
        placar: [
            { ...LARISSA, pontos: 0 },
            { ...BRU, pontos: 0 },
        ],
        vez: null,
        anterior: null,
        ...valores,
    };
}

function vez(valores: Partial<VezEmAndamento> = {}): VezEmAndamento {
    return {
        numero: 1,
        rodada: 1,
        fase: "escolhendo",
        segundosRestantes: 18,
        escolhedor: LARISSA,
        opcoes: [],
        palavra: null,
        dica: null,
        minhaForca: null,
        forcas: [],
        ...valores,
    };
}

const ADIVINHANDO_BRU = estado({
    eu: 2,
    vez: vez({
        fase: "adivinhando",
        segundosRestantes: 70,
        opcoes: null,
        dica: "Ave",
        minhaForca: { casas: ["A", null, "A", null, "A"], letras: ["A", "Z"], erros: 1, acertou: false, terminou: false },
        forcas: [{ ...BRU, erros: 1, casasAbertas: 3, acertou: false, terminou: false }],
    }),
});

// A partida que o back devolve muda quando alguém age, como no servidor.
let partida: EstadoDaPartida;

function responder(inicial: EstadoDaPartida, sala: object = SALA) {
    partida = inicial;
    get.mockImplementation((url: string) => {
        if (url === "/salas/5") {
            return Promise.resolve({ data: sala });
        }
        return Promise.resolve({ data: partida });
    });
}

function depoisDeAgir(proxima: EstadoDaPartida) {
    post.mockImplementation(() => {
        partida = proxima;
        return Promise.resolve({ data: partida });
    });
}

function abrirPartida() {
    entrarComo("Larissa Souza");
    abrir("/salas/5/partida");
}

describe("página da partida", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("quem criou a sala começa a partida e escolhe a primeira palavra", async () => {
        responder(estado({ situacao: "esperando" }));
        depoisDeAgir(estado({ vez: vez() }));
        const usuario = userEvent.setup();
        abrirPartida();

        await usuario.click(await screen.findByRole("button", { name: "Começar a partida" }));

        expect(post).toHaveBeenCalledWith("/salas/5/partida");
        expect(await screen.findByRole("heading", { name: "Sua vez de escolher a palavra" })).toBeTruthy();
        expect(screen.getByRole("timer", { name: "Tempo para escolher: 18 segundos" })).toBeTruthy();
        expect(screen.getByText("Rodada 1 de 2 · vez de você")).toBeTruthy();
    });

    it("quem não criou a sala espera, e com 1 jogador não dá para começar", async () => {
        responder(estado({ situacao: "esperando" }), { ...SALA, donoId: 99 });
        abrirPartida();

        expect(await screen.findByText("Esperando quem criou a sala começar a partida.")).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Começar a partida" })).toBeNull();
    });

    it("com 1 jogador, o botão de começar fica desligado", async () => {
        responder(estado({ situacao: "esperando", placar: [{ ...LARISSA, pontos: 0 }] }));
        abrirPartida();

        const botao = await screen.findByRole("button", { name: "Começar a partida" });

        expect(botao.hasAttribute("disabled")).toBe(true);
        expect(screen.getByText(/pelo menos 2 jogadores/)).toBeTruthy();
    });

    it("com lista, escolhe uma das palavras sorteadas", async () => {
        const opcoes = [
            { id: 11, palavra: "GATO", dica: "Bicho" },
            { id: 12, palavra: "SAPO", dica: null },
        ];
        responder(estado({ vez: vez({ opcoes }) }));
        depoisDeAgir(estado({ vez: vez({ fase: "adivinhando", palavra: "SAPO", opcoes: null }) }));
        const usuario = userEvent.setup();
        abrirPartida();

        await usuario.click(await screen.findByRole("button", { name: "SAPO" }));

        expect(post).toHaveBeenCalledWith("/salas/5/partida/palavra", { palavraId: 12 });
        expect(await screen.findByText("Você escolheu a palavra. Agora é acompanhar os outros.")).toBeTruthy();
    });

    it("sem lista, digita a palavra, e o formulário confere antes de enviar", async () => {
        responder(estado({ vez: vez() }));
        depoisDeAgir(estado({ vez: vez({ fase: "adivinhando", palavra: "ARARA", opcoes: null }) }));
        const usuario = userEvent.setup();
        abrirPartida();

        await usuario.click(await screen.findByRole("button", { name: "Escolher esta palavra" }));
        expect(screen.getByText("Informe a palavra.")).toBeTruthy();
        expect(post).not.toHaveBeenCalled();

        await usuario.type(screen.getByLabelText("Palavra"), "  arara ");
        await usuario.click(screen.getByRole("button", { name: "Escolher esta palavra" }));

        expect(post).toHaveBeenCalledWith("/salas/5/partida/palavra", { palavra: "ARARA", dica: null });
    });

    it("quem adivinha vê a dica e as casas, e chuta pelo teclado da tela e pelo do computador", async () => {
        responder(ADIVINHANDO_BRU);
        depoisDeAgir(ADIVINHANDO_BRU);
        const usuario = userEvent.setup();
        abrirPartida();

        expect(await screen.findByText("Ave")).toBeTruthy();
        expect(screen.getByRole("img", { name: "Palavra: A, vazio, A, vazio, A" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Z, não está na palavra" }).hasAttribute("disabled")).toBe(true);

        await usuario.click(screen.getByRole("button", { name: "R" }));
        expect(post).toHaveBeenLastCalledWith("/salas/5/partida/letras", { letra: "R" });

        await usuario.keyboard("b");
        expect(post).toHaveBeenLastCalledWith("/salas/5/partida/letras", { letra: "B" });
    });

    it("não envia a letra repetida", async () => {
        responder(ADIVINHANDO_BRU);
        const usuario = userEvent.setup();
        abrirPartida();
        await screen.findByText("Ave");

        await usuario.keyboard("a");

        expect(screen.getByText("Você já tentou a letra A.")).toBeTruthy();
        expect(post).not.toHaveBeenCalled();
    });

    it("quem escolheu vê a palavra e o bonequinho de cada um", async () => {
        responder(
            estado({
                vez: vez({
                    fase: "adivinhando",
                    palavra: "ARARA",
                    opcoes: null,
                    forcas: [
                        { ...BRU, erros: 2, casasAbertas: 3, acertou: false, terminou: false },
                        { participanteId: 3, apelido: "Caio", erros: 0, casasAbertas: 5, acertou: true, terminou: true },
                    ],
                }),
            }),
        );
        abrirPartida();

        const forcas = await screen.findByRole("region", { name: "Como cada um está" });

        expect(screen.getByRole("img", { name: "Palavra: A, R, A, R, A" })).toBeTruthy();
        expect(within(forcas).getByRole("img", { name: "Forca de Bru com cabeça e tronco" })).toBeTruthy();
        expect(within(forcas).getByText("3 de 5 letras")).toBeTruthy();
        expect(within(forcas).getByText("Acertou!")).toBeTruthy();
        expect(screen.queryByRole("group", { name: "Teclado" })).toBeNull();
    });

    it("no intervalo, mostra a palavra, os pontos de cada um e quem escolhe a próxima", async () => {
        responder(
            estado({
                placar: [
                    { ...LARISSA, pontos: 10 },
                    { ...BRU, pontos: 110 },
                ],
                vez: vez({ numero: 2, fase: "intervalo", segundosRestantes: 4, escolhedor: BRU, opcoes: null }),
                anterior: {
                    numero: 1,
                    rodada: 1,
                    escolhedor: LARISSA,
                    palavra: "ARARA",
                    dica: "Ave",
                    pontosDeQuemEscolheu: 10,
                    jogadores: [{ ...BRU, acertou: true, erros: 1, pontos: 110 }],
                },
            }),
        );
        abrirPartida();

        expect(await screen.findByRole("heading", { name: "A palavra era ARARA" })).toBeTruthy();
        expect(screen.getByText("Acertou com 1 erro")).toBeTruthy();
        expect(screen.getByRole("timer", { name: "Bru escolhe a próxima palavra em: 4 segundos" })).toBeTruthy();
        const placar = within(screen.getByRole("region", { name: "Placar" })).getAllByRole("listitem");
        expect(placar.map((linha) => linha.textContent)).toEqual(["1ºBru110 pontos", "2ºLarissa (você)10 pontos"]);
    });

    it("no fim, mostra quem ganhou e o placar final", async () => {
        responder(
            estado({
                situacao: "encerrada",
                placar: [
                    { ...LARISSA, pontos: 130 },
                    { ...BRU, pontos: 120 },
                ],
            }),
        );
        abrirPartida();

        expect(await screen.findByText("Larissa ganhou a partida!")).toBeTruthy();
        expect(screen.getByRole("region", { name: "Placar final" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Voltar para as salas" }).getAttribute("href")).toBe("/salas");
    });

    it("quem não está na sala vê o motivo e o caminho para entrar", async () => {
        get.mockImplementation((url: string) =>
            url === "/salas/5" ? Promise.resolve({ data: SALA }) : Promise.reject(erroDaApi(403, { mensagem: "Entre na sala para jogar." })),
        );
        abrirPartida();

        expect(await screen.findByText("Entre na sala para jogar.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Entrar na sala" }).getAttribute("href")).toBe("/salas/5/entrar");
    });
});
