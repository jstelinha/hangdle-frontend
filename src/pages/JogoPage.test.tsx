import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { SEM_RESPOSTA } from "../api/erros";
import { CHAVE_CHUTES_DO_DIA } from "../jogo/chutesDoDia";
import { Rodada } from "../jogo/Rodada";
import { abrir, entrarComo, erroDaApi, erroDeRede } from "../testes/ferramentas";
import type { JogoDoDia } from "../types/jogo";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

const DIA = "2026-11-03";
const PALAVRA = "MAÇÃ";
const MACA_DO_DIA = { dia: DIA, palavra: PALAVRA, categoria: "Comida" };
const HOJE_NO_SERVIDOR = { dia: DIA, jogadores: 3, naoAcertaram: 1, distribuicao: [{ letras: 4, jogadores: 2 }] };

// Um back de mentira com a mesma regra do de verdade: o token leva as letras, e a palavra só vem no fim.
function jogoCom(letras: string[]): JogoDoDia {
    const rodada = Rodada.aPartirDosChutes(PALAVRA, letras);
    const terminou = rodada.estado !== "jogando";
    return {
        dia: DIA,
        categoria: "Comida",
        casas: rodada.casas.map((casa) => (casa.revelada ? casa.caractere : null)),
        letras: rodada.chutes,
        erros: rodada.erros,
        acertou: rodada.estado === "acertou",
        terminou,
        palavra: terminou ? PALAVRA : null,
        token: JSON.stringify(rodada.chutes),
    };
}

const SERVIDOR = {
    "/palavra-do-dia": jogoCom([]),
    "/palavra-do-dia/estatisticas": HOJE_NO_SERVIDOR,
    "/resultados": { resultados: [] },
};

// O que o POST /resultados responde: 201, ou o erro que o teste escolher.
let aoSalvar: () => Promise<unknown>;
// As palavras que o back mandou antes do fim, para conferir que nenhuma foi mandada.
let palavrasAntesDoFim: (string | null)[];

function responderComo(servidor: Record<string, unknown>) {
    get.mockImplementation(async (url: string) => ({ data: servidor[url] }));
}

function letraDoChute(corpo: unknown): { token: string; letra: string } {
    return corpo as { token: string; letra: string };
}

function chutesEnviados(): { token: string; letra: string }[] {
    return post.mock.calls.filter(([url]) => url === "/palavra-do-dia/letras").map(([, corpo]) => letraDoChute(corpo));
}

function tecla(letra: string): HTMLElement {
    return screen.getByRole("button", { name: letra });
}

// A janela do resultado abre sozinha um instante depois do fim; o findByRole espera por ela.
async function janelaDoResultado(titulo = "Você acertou!") {
    return within(await screen.findByRole("dialog", { name: titulo }));
}

function numeroDoProgresso(janela: ReturnType<typeof within>, rotulo: string): string {
    return janela.getByText(rotulo, { selector: "dt" }).nextElementSibling?.textContent ?? "";
}

async function verComoTodoMundoFoi() {
    fireEvent.click(await screen.findByRole("tab", { name: "Todo mundo hoje" }));
    return screen.findByRole("table", { name: "Como todo mundo foi hoje" });
}

function jaChutou(dia: string, chutes: string[]) {
    localStorage.setItem(CHAVE_CHUTES_DO_DIA, JSON.stringify({ dia, chutes }));
}

async function abrirJogo() {
    abrir("/jogo");
    await screen.findByText("Comida");
}

// Clica nas teclas sem esperar as respostas, e depois espera o back responder todas.
async function clicar(letras: string) {
    for (const letra of letras) {
        fireEvent.click(tecla(letra));
    }
    await act(async () => {
        await new Promise((resolver) => setTimeout(resolver, 0));
    });
}

describe("palavra do dia", () => {
    beforeEach(() => {
        get.mockReset();
        post.mockReset();
        palavrasAntesDoFim = [];
        aoSalvar = async () => ({ status: 201, data: {} });
        post.mockImplementation(async (url: string, corpo?: unknown) => {
            if (url !== "/palavra-do-dia/letras") {
                return aoSalvar();
            }
            const { token, letra } = letraDoChute(corpo);
            const antes: string[] = JSON.parse(token);
            if (antes.includes(letra)) {
                throw erroDaApi(409, { mensagem: `Você já chutou a letra ${letra}.` });
            }
            const jogo = jogoCom([...antes, letra]);
            if (!jogo.terminou) {
                palavrasAntesDoFim.push(jogo.palavra);
            }
            return { data: jogo };
        });
        responderComo(SERVIDOR);
    });

    it("visitante joga sem conta e vê no cabeçalho onde entrar", async () => {
        await abrirJogo();

        expect(screen.getByRole("heading", { name: "Palavra do dia" })).toBeTruthy();
        expect(within(screen.getByRole("navigation", { name: "Conta" })).getByRole("link", { name: "Entrar" })).toBeTruthy();
    });

    it("quem entrou vê o próprio nome no cabeçalho", async () => {
        entrarComo("Larissa Souza");

        await abrirJogo();

        expect(screen.getByText("Larissa Souza")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Sair" })).toBeTruthy();
    });

    it("começa pelo back, sem a palavra, com a forca e as casas vazias", async () => {
        await abrirJogo();

        expect(get).toHaveBeenCalledWith("/palavra-do-dia");
        expect(screen.getByRole("img", { name: "Forca vazia" })).toBeTruthy();
        expect(screen.getByRole("img", { name: "Palavra: vazio, vazio, vazio, vazio" })).toBeTruthy();
    });

    it("cada letra vai para o back com o token da anterior, e a palavra só chega no fim", async () => {
        await abrirJogo();

        await clicar("ZMAC");

        expect(chutesEnviados()).toEqual([
            { token: "[]", letra: "Z" },
            { token: '["Z"]', letra: "M" },
            { token: '["Z","M"]', letra: "A" },
            { token: '["Z","M","A"]', letra: "C" },
        ]);
        expect(palavrasAntesDoFim).toEqual([null, null, null]);
        expect(screen.getByRole("region", { name: /^(Você acertou a palavra do dia!|O boneco ficou completo\.)$/ }).textContent).toContain(`A palavra era ${PALAVRA}.`);
    });

    it("letra certa revela, errada desenha o boneco e repetida só avisa", async () => {
        const usuario = userEvent.setup();
        await abrirJogo();

        await usuario.click(tecla("M"));
        expect(await screen.findByRole("img", { name: "Palavra: M, vazio, vazio, vazio" })).toBeTruthy();

        await usuario.keyboard("z");
        expect(await screen.findByRole("img", { name: "Forca com cabeça" })).toBeTruthy();
        expect(screen.getByText("1 de 6")).toBeTruthy();

        await usuario.keyboard("z");
        expect(screen.getByText("Você já tentou a letra Z. Letra repetida não conta como erro.")).toBeTruthy();
        expect(screen.getByRole("img", { name: "Forca com cabeça" })).toBeTruthy();
        expect(chutesEnviados()).toHaveLength(2);
    });

    it("as letras digitadas rápido vão todas, na ordem, sem esperar a resposta de cada uma", async () => {
        await abrirJogo();

        act(() => {
            for (const letra of "zmzac") {
                fireEvent.keyDown(window, { key: letra });
            }
        });
        expect(await screen.findByRole("heading", { name: "Você acertou a palavra do dia!" })).toBeTruthy();

        expect(chutesEnviados().map(({ letra }) => letra)).toEqual(["Z", "M", "A", "C"]);
    });

    it("completar a palavra mostra o acerto e em quantas letras", async () => {
        await abrirJogo();

        await clicar("ZMAC");

        expect(screen.getByRole("heading", { name: "Você acertou a palavra do dia!" })).toBeTruthy();
        expect(screen.queryByRole("group", { name: "Teclado" })).toBeNull();
        const janela = await janelaDoResultado();
        expect(numeroDoProgresso(janela, "letras chutadas")).toBe("4");
        expect(numeroDoProgresso(janela, "erro")).toBe("1");
    });

    it("a janela do resultado abre sozinha no fim, fecha e abre de novo pelo botão", async () => {
        const usuario = userEvent.setup();
        await abrirJogo();
        await clicar("ZMAC");

        const janela = await janelaDoResultado();
        await usuario.click(janela.getByRole("button", { name: "Fechar" }));
        expect(screen.queryByRole("dialog")).toBeNull();

        await usuario.click(screen.getByRole("button", { name: "Ver resultado" }));
        expect(screen.getByRole("dialog", { name: "Você acertou!" })).toBeTruthy();
    });

    it("compartilhar copia o resultado em quadrados, sem a palavra", async () => {
        const usuario = userEvent.setup();
        await abrirJogo();
        await clicar("ZMAC");

        const janela = await janelaDoResultado();
        await usuario.click(janela.getByRole("button", { name: "Compartilhar" }));

        const copiado = await navigator.clipboard.readText();
        expect(copiado).toBe(["Hangdle 03/11/2026 · Comida", "🟥🟩🟩🟩", "Acertei com 1 erro.", `${window.location.origin}/jogo`].join("\n"));
        expect(copiado).not.toContain(PALAVRA);
        expect(janela.getByText("Resultado copiado. É só colar onde quiser.")).toBeTruthy();
    });

    it("no sexto erro o boneco fica completo e a palavra aparece", async () => {
        await abrirJogo();

        await clicar("ZWYKLB");

        expect(screen.getByRole("heading", { name: "O boneco ficou completo." })).toBeTruthy();
        expect(screen.getByRole("img", { name: "Forca com o boneco completo" })).toBeTruthy();
        expect(screen.getByRole("region", { name: /^(Você acertou a palavra do dia!|O boneco ficou completo\.)$/ }).textContent).toContain(`A palavra era ${PALAVRA}.`);
        expect(await janelaDoResultado("Não foi dessa vez")).toBeTruthy();
    });

    it("se o back não responder a letra, avisa e deixa digitar de novo", async () => {
        await abrirJogo();
        post.mockRejectedValueOnce(erroDeRede());

        await clicar("M");
        expect(screen.getByText(SEM_RESPOSTA)).toBeTruthy();
        await clicar("M");

        expect(screen.getByRole("img", { name: "Palavra: M, vazio, vazio, vazio" })).toBeTruthy();
    });

    it("cada chute fica guardado no navegador", async () => {
        await abrirJogo();

        await clicar("ZM");

        expect(JSON.parse(localStorage.getItem(CHAVE_CHUTES_DO_DIA) ?? "null")).toEqual({ dia: DIA, chutes: ["Z", "M"] });
    });

    it("recarregar no meio da partida manda as letras de novo e continua de onde parou", async () => {
        jaChutou(DIA, ["Z", "M"]);

        await abrirJogo();

        expect(screen.getByRole("img", { name: "Forca com cabeça" })).toBeTruthy();
        expect(screen.getByRole("img", { name: "Palavra: M, vazio, vazio, vazio" })).toBeTruthy();
        expect(chutesEnviados().map(({ letra }) => letra)).toEqual(["Z", "M"]);
    });

    it("se o back recusar uma letra guardada, a partida fica até a letra de antes", async () => {
        jaChutou(DIA, ["Z", "Z", "M"]);

        await abrirJogo();

        expect(screen.getByRole("img", { name: "Forca com cabeça" })).toBeTruthy();
        expect(screen.getByRole("img", { name: "Palavra: vazio, vazio, vazio, vazio" })).toBeTruthy();
    });

    it("quem já jogou hoje vê o resultado e quanto falta para a próxima palavra", async () => {
        jaChutou(DIA, ["M", "A", "C"]);

        await abrirJogo();

        expect(screen.getByRole("heading", { name: "Você acertou a palavra do dia!" })).toBeTruthy();
        expect(screen.queryByRole("group", { name: "Teclado" })).toBeNull();
        const janela = await janelaDoResultado();
        expect(janela.getByRole("timer").textContent).toMatch(/^Próxima palavra em \d{2}:\d{2}:\d{2}$/);
    });

    it("chutes de outro dia não contam", async () => {
        jaChutou("2026-11-02", ["Z", "M"]);

        await abrirJogo();

        expect(screen.getByRole("img", { name: "Forca vazia" })).toBeTruthy();
        expect(chutesEnviados()).toEqual([]);
    });

    it("no fim, mostra como todo mundo foi hoje com a sua coluna destacada", async () => {
        await abrirJogo();

        await clicar("ZMAC");

        const tabela = await screen.findByRole("table", { name: "Como todo mundo foi hoje" });
        const linhas = within(tabela)
            .getAllByRole("row")
            .slice(1)
            .map((linha) => within(linha).getAllByRole("cell").map((celula) => celula.textContent));
        expect(linhas).toEqual([
            ["4 letras (você)", "3"],
            ["Não acertou", "1"],
        ]);
        expect(get).toHaveBeenCalledWith("/palavra-do-dia/estatisticas", { params: { dia: DIA } });
        expect(screen.queryByText("Ver os números em tabela")).toBeNull();
        expect(screen.queryByText(/^Só entram as partidas/)).toBeNull();
    });

    it("quem está logado tem o resultado salvo na conta ao terminar", async () => {
        entrarComo("Larissa Souza");
        await abrirJogo();

        await clicar("ZMAC");

        expect(await screen.findByText("Resultado salvo na sua conta.", { exact: false })).toBeTruthy();
        expect(post).toHaveBeenCalledWith("/resultados", { dia: DIA, letras: ["Z", "M", "A", "C"] });
        const tabela = await verComoTodoMundoFoi();
        expect(within(tabela).getByText("4 letras (você)").nextElementSibling?.textContent).toBe("2");
    });

    it("quem tem conta vê os seus números e com quantos erros acertou", async () => {
        const anteriores = [
            { ...MACA_DO_DIA, dia: "2026-11-02", letras: ["M", "B", "Z", "A", "C"], chutes: 5, erros: 2, acertou: true },
            { ...MACA_DO_DIA, dia: "2026-11-01", letras: ["Z", "W", "Y", "K", "L", "B"], chutes: 6, erros: 6, acertou: false },
        ];
        get.mockImplementation(async (url: string, config?: { params?: unknown }) => {
            if (url === "/resultados") {
                const dia = (config?.params as { dia?: string } | undefined)?.dia;
                return { data: { resultados: dia ? anteriores.filter((resultado) => resultado.dia === dia) : anteriores } };
            }
            return { data: SERVIDOR[url as keyof typeof SERVIDOR] };
        });
        entrarComo("Larissa Souza");
        await abrirJogo();

        await clicar("ZMAC");

        const janela = await janelaDoResultado();
        await janela.findByText("partidas", { selector: "dt" });
        expect(numeroDoProgresso(janela, "partidas")).toBe("3");
        expect(numeroDoProgresso(janela, "de acertos")).toMatch(/^67\s?%$/);
        expect(numeroDoProgresso(janela, "sequência")).toBe("2");
        expect(numeroDoProgresso(janela, "melhor sequência")).toBe("2");
        expect(numeroDoProgresso(janela, "letras chutadas")).toBe("4");
        expect(numeroDoProgresso(janela, "erro")).toBe("1");
        const distribuicao = within(janela.getByRole("table", { name: "Com quantos erros você acertou" }));
        const quantas = (linha: string) => distribuicao.getByRole("rowheader", { name: linha }).nextElementSibling?.textContent;
        expect(quantas("0 erros")).toBe("0");
        expect(quantas("1 erro (hoje)")).toBe("1");
        expect(quantas("2 erros")).toBe("1");
        expect(quantas("Boneco completo")).toBe("1");
    });

    it("resultado que já estava na conta conta como salvo", async () => {
        aoSalvar = async () => {
            throw erroDaApi(409, { mensagem: "Você já jogou a palavra deste dia." });
        };
        entrarComo("Larissa Souza");
        jaChutou(DIA, ["M", "A", "C"]);

        await abrirJogo();

        expect(await screen.findByText("Resultado salvo na sua conta.", { exact: false })).toBeTruthy();
    });

    it("se não der para salvar na conta, avisa e o seu resultado entra no gráfico", async () => {
        aoSalvar = async () => {
            throw erroDeRede();
        };
        entrarComo("Larissa Souza");
        jaChutou(DIA, ["Z", "M", "A", "C"]);

        await abrirJogo();

        expect((await screen.findByRole("alert")).textContent).toContain("Não deu para salvar o resultado na sua conta agora.");
        const tabela = await verComoTodoMundoFoi();
        expect(within(tabela).getByText("4 letras (você)").nextElementSibling?.textContent).toBe("3");
    });

    it("quem está logado vê do back que já jogou hoje, em qualquer aparelho", async () => {
        responderComo({
            ...SERVIDOR,
            "/resultados": { resultados: [{ ...MACA_DO_DIA, letras: ["M", "A", "C"], chutes: 3, erros: 0, acertou: true }] },
        });
        entrarComo("Larissa Souza");

        await abrirJogo();

        expect(screen.getByRole("heading", { name: "Você acertou a palavra do dia!" })).toBeTruthy();
        expect(await screen.findByText("Resultado salvo na sua conta.", { exact: false })).toBeTruthy();
        expect(get).toHaveBeenCalledWith("/resultados", { params: { dia: DIA } });
        expect(post).not.toHaveBeenCalled();
    });

    it("se o back não responder o histórico, usa os chutes deste navegador", async () => {
        get.mockImplementation(async (url: string) => {
            if (url === "/resultados") {
                throw erroDeRede();
            }
            return { data: SERVIDOR[url as keyof typeof SERVIDOR] };
        });
        entrarComo("Larissa Souza");
        jaChutou(DIA, ["Z", "M"]);

        await abrirJogo();

        expect(screen.getByRole("img", { name: "Forca com cabeça" })).toBeTruthy();
    });

    it("visitante não manda nada para a conta", async () => {
        jaChutou(DIA, ["M", "A", "C"]);

        await abrirJogo();
        await screen.findByRole("table", { name: "Como todo mundo foi hoje" });

        expect(post).not.toHaveBeenCalledWith("/resultados", expect.anything());
    });

    it("no fim, convida o visitante a criar conta", async () => {
        jaChutou(DIA, ["M", "A", "C"]);

        await abrirJogo();

        const convite = within(await screen.findByRole("complementary", { name: "Veja o seu progresso" }));
        expect(convite.getByRole("link", { name: "Criar conta" }).getAttribute("href")).toBe("/cadastro");
        expect(convite.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
    });

    it("quem já tem conta não vê o convite", async () => {
        entrarComo("Larissa Souza");
        jaChutou(DIA, ["M", "A", "C"]);

        await abrirJogo();

        await janelaDoResultado();
        expect(screen.queryByRole("complementary", { name: "Veja o seu progresso" })).toBeNull();
    });

    it("se as estatísticas falharem, o resultado continua na tela", async () => {
        get.mockImplementation(async (url: string) => {
            if (url === "/palavra-do-dia") {
                return { data: SERVIDOR["/palavra-do-dia"] };
            }
            throw erroDeRede();
        });
        jaChutou(DIA, ["M", "A", "C"]);

        await abrirJogo();

        expect(await screen.findByText("Não deu para carregar como todo mundo foi hoje.")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Você acertou a palavra do dia!" })).toBeTruthy();
    });

    it("servidor fora do ar: avisa e deixa tentar de novo", async () => {
        get.mockRejectedValueOnce(erroDeRede());
        const usuario = userEvent.setup();
        entrarComo("Larissa Souza");
        abrir("/jogo");

        expect((await screen.findByRole("alert")).textContent).toBe(SEM_RESPOSTA);

        await usuario.click(screen.getByRole("button", { name: "Tentar de novo" }));

        expect(await screen.findByText("Comida")).toBeTruthy();
    });
});
