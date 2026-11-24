import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);
const put = vi.mocked(api.put);

const ANIMAIS = { id: 3, nome: "Animais", totalDePalavras: 1 };
const GATO = { id: 8, listaId: 3, palavra: "GATO", dica: "Mia e gosta de leite" };
const PAGINA = { itens: [GATO], pagina: 1, porPagina: 10, total: 1, totalDePaginas: 1 };

function campo(rotulo: string): HTMLInputElement {
    const elemento = screen.getByLabelText(rotulo);
    if (!(elemento instanceof HTMLInputElement)) {
        throw new Error(`${rotulo} não é um campo de texto`);
    }
    return elemento;
}

async function abrirFormulario(endereco: string) {
    entrarComo("Larissa Souza");
    abrir(endereco);
    await screen.findByLabelText("Palavra");
}

async function salvarCom(usuario: UserEvent, palavra: string, dica = "") {
    await usuario.clear(campo("Palavra"));
    await usuario.clear(campo("Dica (opcional)"));
    if (palavra !== "") {
        await usuario.type(campo("Palavra"), palavra);
    }
    if (dica !== "") {
        await usuario.type(campo("Dica (opcional)"), dica);
    }
    await usuario.click(screen.getByRole("button", { name: "Salvar" }));
}

describe("cadastro de palavra", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        get.mockImplementation((url: string) => {
            const respostas: Record<string, unknown> = { "/listas/3": ANIMAIS, "/listas/3/palavras/8": GATO };
            return Promise.resolve({ data: respostas[url] ?? PAGINA });
        });
    });

    it("exige a palavra, sem chamar a API", async () => {
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/palavras/nova");

        await salvarCom(usuario, "");

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("Informe a palavra.")).toBeTruthy();
        expect(document.activeElement).toBe(campo("Palavra"));
    });

    it.each([
        ["curta demais", "GA", "A palavra precisa ter de 3 a 30 letras."],
        ["com número", "R2D2", "Use só letras, com espaço ou hífen entre as partes."],
        ["com hífen na ponta", "GATO-", "Use só letras, com espaço ou hífen entre as partes."],
    ])("recusa a palavra %s", async (_caso, palavra, mensagem) => {
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/palavras/nova");

        await salvarCom(usuario, palavra);

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText(mensagem)).toBeTruthy();
    });

    it("escreve a palavra em maiúsculas enquanto digita", async () => {
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/palavras/nova");

        await usuario.type(campo("Palavra"), "onça");

        expect(campo("Palavra").value).toBe("ONÇA");
    });

    it("salva e deixa o formulário limpo para a próxima", async () => {
        post.mockResolvedValueOnce({ data: { id: 10, listaId: 3, palavra: "GUARDA-CHUVA", dica: "Abre quando chove" } });
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/palavras/nova");

        await salvarCom(usuario, "guarda-chuva", "  Abre   quando chove ");

        expect(post).toHaveBeenCalledWith("/listas/3/palavras", { palavra: "GUARDA-CHUVA", dica: "Abre quando chove" });
        expect(await screen.findByText("A palavra GUARDA-CHUVA entrou na lista. Escreva a próxima ou volte para a lista.")).toBeTruthy();
        expect(campo("Palavra").value).toBe("");
        expect(campo("Dica (opcional)").value).toBe("");
        expect(document.activeElement).toBe(campo("Palavra"));
    });

    it("sem dica, manda a dica vazia como null", async () => {
        post.mockResolvedValueOnce({ data: { id: 11, listaId: 3, palavra: "PATO", dica: null } });
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/palavras/nova");

        await salvarCom(usuario, "pato");

        expect(post).toHaveBeenCalledWith("/listas/3/palavras", { palavra: "PATO", dica: null });
    });

    it("mostra no campo a palavra repetida recusada pela API", async () => {
        const repetida = "Essa palavra já está na lista.";
        post.mockRejectedValueOnce(erroDaApi(409, { mensagem: repetida, campos: { palavra: repetida } }));
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/palavras/nova");

        await salvarCom(usuario, "gato");

        expect((await screen.findByRole("alert")).textContent).toBe(repetida);
        expect(campo("Palavra").getAttribute("aria-invalid")).toBe("true");
        expect(campo("Palavra").value).toBe("GATO");
    });
});

describe("edição de palavra", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        get.mockImplementation((url: string) => {
            const respostas: Record<string, unknown> = { "/listas/3": ANIMAIS, "/listas/3/palavras/8": GATO };
            return Promise.resolve({ data: respostas[url] ?? PAGINA });
        });
    });

    it("chega com a palavra e a dica, e tirar a dica manda null", async () => {
        put.mockResolvedValueOnce({ data: { ...GATO, dica: null } });
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/palavras/8/editar");

        expect(campo("Palavra").value).toBe("GATO");
        expect(campo("Dica (opcional)").value).toBe("Mia e gosta de leite");
        await salvarCom(usuario, "GATO");

        expect(put).toHaveBeenCalledWith("/listas/3/palavras/8", { palavra: "GATO", dica: null });
        expect(await screen.findByText("Palavra GATO salva.")).toBeTruthy();
        expect(await screen.findByRole("heading", { name: "Animais" })).toBeTruthy();
    });

    it("avisa quando a palavra não existe nesta lista", async () => {
        get.mockRejectedValueOnce(erroDaApi(404, { mensagem: "Palavra não encontrada nesta lista." }));
        entrarComo("Larissa Souza");
        abrir("/listas/3/palavras/99/editar");

        expect((await screen.findByRole("alert")).textContent).toBe("Palavra não encontrada nesta lista.");
        expect(screen.queryByLabelText("Palavra")).toBeNull();
    });
});
