import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

// A mesma vez de ADIVINHANDO_BRU (a palavra é ARARA), mas antes de a Bru chutar qualquer letra.
const BRU_SEM_LETRAS = estado({
    ...ADIVINHANDO_BRU,
    vez: vez({
        ...ADIVINHANDO_BRU.vez,
        minhaForca: { casas: [null, null, null, null, null], letras: [], erros: 0, acertou: false, terminou: false },
    }),
});

// Um back lento, como numa rede ruim: a consulta devolve a partida de quando chegou ao back, 300 ms depois; o chute
// leva 400 ms para ser conferido e devolve a partida já com a letra.
const CONSULTA_LENTA = 300;
const CHUTE_LENTO = 400;

function comLetra(atual: EstadoDaPartida, letra: string): EstadoDaPartida {
    const forca = atual.vez?.minhaForca;
    if (!atual.vez || !forca) {
        return atual;
    }
    const casas = [..."ARARA"].map((daPalavra, indice) => (daPalavra === letra ? letra : (forca.casas[indice] ?? null)));
    const erros = forca.erros + ("ARARA".includes(letra) ? 0 : 1);
    const acertou = casas.every((casa) => casa !== null);
    const minhaForca = { casas, letras: [...forca.letras, letra], erros, acertou, terminou: acertou || erros >= 6 };
    return { ...atual, vez: { ...atual.vez, minhaForca } };
}

function responderDevagar(inicial: EstadoDaPartida) {
    partida = inicial;
    get.mockImplementation((url: string) => {
        if (url === "/salas/5") {
            return Promise.resolve({ data: SALA });
        }
        const naHora = partida;
        return new Promise((resolver) => setTimeout(() => resolver({ data: naHora }), CONSULTA_LENTA));
    });
    post.mockImplementation(
        (_url: string, corpo?: unknown) =>
            new Promise((resolver) =>
                setTimeout(() => {
                    partida = comLetra(partida, (corpo as { letra: string }).letra);
                    resolver({ data: partida });
                }, CHUTE_LENTO),
            ),
    );
}

async function esperar(milissegundos: number) {
    await act(() => vi.advanceTimersByTimeAsync(milissegundos));
}

// Digita como quem é rápido no teclado do computador: uma tecla logo depois da outra, sem esperar a resposta.
function digitarRapido(teclas: string) {
    act(() => {
        for (const tecla of teclas) {
            fireEvent.keyDown(window, { key: tecla });
        }
    });
}

function letrasEnviadas(): string[] {
    return post.mock.calls.map(([, corpo]) => (corpo as { letra: string }).letra);
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
        expect(screen.getByText("Rodada 1 de 2 · sua vez")).toBeTruthy();
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

    it("quando a fase muda, anuncia o recado e leva o foco que se perdeu para o título da seção nova", async () => {
        responder(estado({ vez: vez({ opcoes: [{ id: 12, palavra: "SAPO", dica: null }] }) }));
        depoisDeAgir(estado({ vez: vez({ fase: "adivinhando", palavra: "SAPO", opcoes: null }) }));
        const usuario = userEvent.setup();
        abrirPartida();
        await screen.findByRole("heading", { name: "Sua vez de escolher a palavra" });
        const regiaoViva = document.querySelector("main [aria-live='polite']");
        expect(regiaoViva?.textContent).toBe("");

        // O botão da palavra some com a seção da escolha, e o foco ia ficar perdido.
        await usuario.click(screen.getByRole("button", { name: "SAPO" }));

        const titulo = await screen.findByRole("heading", { name: "Sua palavra" });
        expect(regiaoViva?.textContent).toBe("Os outros estão adivinhando a sua palavra.");
        expect(document.activeElement).toBe(titulo);
    });

    it("quando a fase muda pela consulta, não tira o foco de quem está em outro lugar", async () => {
        responder(estado({ eu: 2, vez: vez() }));
        abrirPartida();
        await screen.findByRole("heading", { name: "Larissa está escolhendo a palavra" });
        const voltar = screen.getByRole("link", { name: "Voltar para a sala" });
        voltar.focus();

        partida = ADIVINHANDO_BRU;

        expect(await screen.findByRole("heading", { name: "Adivinhe a palavra" }, { timeout: 2500 })).toBeTruthy();
        expect(document.querySelector("main [aria-live='polite']")?.textContent).toBe("Hora de adivinhar: 5 letras.");
        expect(document.activeElement).toBe(voltar);
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
        expect(screen.getByText("Rodada 1 de 2 · vez de Larissa")).toBeTruthy();
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

    describe("com o back lento", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("não perde as letras digitadas rápido: vão uma por vez, na ordem, e todas aparecem na tela", async () => {
            responderDevagar(BRU_SEM_LETRAS);
            abrirPartida();
            await esperar(CONSULTA_LENTA);
            expect(screen.getByText("Ave")).toBeTruthy();

            // A vai para o back; B e T esperam na fila. O segundo A é repetido e não entra.
            digitarRapido("aba");
            expect(screen.getByText("Você já tentou a letra A.")).toBeTruthy();
            digitarRapido("t");
            expect(letrasEnviadas()).toEqual(["A"]);

            // Os três chutes levam 1,2 s. A consulta de 1 s depois da primeira começa durante o chute do T, antes de o
            // back conferir o T, e chega depois da resposta dele: com a partida velha, ela não pode apagar o T da tela.
            await esperar(3 * CHUTE_LENTO + CONSULTA_LENTA);

            expect(letrasEnviadas()).toEqual(["A", "B", "T"]);
            expect(get.mock.calls.filter(([url]) => url === "/salas/5/partida")).toHaveLength(2);
            expect(screen.getByRole("img", { name: "Palavra: A, vazio, A, vazio, A" })).toBeTruthy();
            expect(screen.getByRole("button", { name: "A, está na palavra" })).toBeTruthy();
            expect(screen.getByRole("button", { name: "B, não está na palavra" })).toBeTruthy();
            expect(screen.getByRole("button", { name: "T, não está na palavra" })).toBeTruthy();
            expect(screen.getByText("2 de 6")).toBeTruthy();
        });

        it("quando a palavra é descoberta, as letras que esperavam na fila não vão para o back", async () => {
            responderDevagar(ADIVINHANDO_BRU);
            abrirPartida();
            await esperar(CONSULTA_LENTA);

            digitarRapido("rqw");
            await esperar(3 * CHUTE_LENTO);

            expect(letrasEnviadas()).toEqual(["R"]);
            expect(screen.getByText("Você acertou! Agora é esperar os outros.")).toBeTruthy();
        });
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
