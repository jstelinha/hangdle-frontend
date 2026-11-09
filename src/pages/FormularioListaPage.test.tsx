import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);
const put = vi.mocked(api.put);

const ANIMAIS = { id: 3, nome: "Animais", totalDePalavras: 12 };
const PAGINA = { itens: [ANIMAIS], pagina: 1, porPagina: 10, total: 1, totalDePaginas: 1 };

function campoNome(): HTMLInputElement {
    const campo = screen.getByLabelText("Nome da lista");
    if (!(campo instanceof HTMLInputElement)) {
        throw new Error("Nome da lista não é um campo de texto");
    }
    return campo;
}

async function abrirFormulario(endereco: string) {
    entrarComo("Larissa Souza");
    abrir(endereco);
    await screen.findByLabelText("Nome da lista");
}

async function salvarCom(usuario: UserEvent, nome: string) {
    await usuario.clear(campoNome());
    if (nome !== "") {
        await usuario.type(campoNome(), nome);
    }
    await usuario.click(screen.getByRole("button", { name: "Salvar" }));
}

describe("cadastro de lista", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        get.mockImplementation((url: string) => Promise.resolve({ data: url === "/listas/3" ? ANIMAIS : PAGINA }));
    });

    it("é uma tela separada da listagem, só para quem entrou", async () => {
        abrir("/listas/nova");
        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();

        await abrirFormulario("/listas/nova");
        expect(screen.getByRole("heading", { name: "Nova lista" })).toBeTruthy();
        expect(screen.queryByRole("table")).toBeNull();
    });

    it("exige o nome, sem chamar a API", async () => {
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/nova");

        await salvarCom(usuario, "   ");

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("Informe o nome da lista.")).toBeTruthy();
        expect(document.activeElement).toBe(campoNome());
    });

    it("recusa um nome curto demais", async () => {
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/nova");

        await salvarCom(usuario, "A");

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText("O nome da lista precisa ter de 2 a 40 caracteres.")).toBeTruthy();
    });

    it("cria sem os espaços sobrando e leva para as palavras da lista nova", async () => {
        const nova = { id: 9, nome: "Frutas tropicais", totalDePalavras: 0 };
        const semPalavras = { itens: [], pagina: 1, porPagina: 10, total: 0, totalDePaginas: 0 };
        post.mockResolvedValueOnce({ data: nova });
        get.mockImplementation((url: string) => Promise.resolve({ data: url === "/listas/9" ? nova : semPalavras }));
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/nova");

        await salvarCom(usuario, "  Frutas   tropicais ");

        expect(post).toHaveBeenCalledWith("/listas", { nome: "Frutas tropicais" });
        expect(await screen.findByText("Lista Frutas tropicais criada. Agora acrescente as palavras.")).toBeTruthy();
        expect(await screen.findByRole("heading", { name: "Frutas tropicais" })).toBeTruthy();
        expect(get).toHaveBeenCalledWith("/listas/9/palavras", { params: { pagina: 1 } });
    });

    it("mostra no campo o nome repetido recusado pela API", async () => {
        const repetida = "Você já tem uma lista com esse nome.";
        post.mockRejectedValueOnce(erroDaApi(409, { mensagem: repetida, campos: { nome: repetida } }));
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/nova");

        await salvarCom(usuario, "Animais");

        expect((await screen.findByRole("alert")).textContent).toBe(repetida);
        expect(campoNome().getAttribute("aria-invalid")).toBe("true");
    });
});

describe("edição de lista", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        get.mockImplementation((url: string) => Promise.resolve({ data: url === "/listas/3" ? ANIMAIS : PAGINA }));
    });

    it("chega com o nome atual e salva o novo", async () => {
        put.mockResolvedValueOnce({ data: { ...ANIMAIS, nome: "Bichos" } });
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/editar");

        expect(get).toHaveBeenCalledWith("/listas/3");
        expect(campoNome().value).toBe("Animais");
        await salvarCom(usuario, "Bichos");

        expect(put).toHaveBeenCalledWith("/listas/3", { nome: "Bichos" });
        expect((await screen.findByRole("status")).textContent).toBe("Lista Bichos salva.");
    });

    it("não abre a lista de outra pessoa", async () => {
        get.mockRejectedValueOnce(erroDaApi(403, { mensagem: "Essa lista é de outra pessoa." }));
        entrarComo("Larissa Souza");
        abrir("/listas/5/editar");

        expect((await screen.findByRole("alert")).textContent).toBe("Essa lista é de outra pessoa.");
        expect(screen.queryByLabelText("Nome da lista")).toBeNull();
    });

    it("cancelar volta para a listagem sem salvar", async () => {
        const usuario = userEvent.setup();
        await abrirFormulario("/listas/3/editar");

        await usuario.click(screen.getByRole("link", { name: "Cancelar" }));

        expect(await screen.findByRole("heading", { name: "Suas listas" })).toBeTruthy();
        expect(put).not.toHaveBeenCalled();
    });
});
